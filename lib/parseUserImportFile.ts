export interface ParsedUserRow {
  rowNumber: number
  name: string
  email: string
}

function normalizeHeader(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, "")
}

function parseCsvLine(line: string): string[] {
  const values: string[] = []
  let current = ""
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    const next = line[i + 1]

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
      continue
    }

    if (char === "," && !inQuotes) {
      values.push(current.trim())
      current = ""
      continue
    }

    current += char
  }

  values.push(current.trim())
  return values
}

function rowsFromTable(headers: string[], dataRows: string[][]): ParsedUserRow[] {
  const normalizedHeaders = headers.map(normalizeHeader)
  const nameIndex = normalizedHeaders.indexOf("name")
  const emailIndex = normalizedHeaders.indexOf("email")

  if (nameIndex === -1 || emailIndex === -1) {
    throw new Error('Missing required columns. The file must include "Name" and "Email" headers.')
  }

  return dataRows
    .map((row, index) => ({
      rowNumber: index + 2,
      name: (row[nameIndex] ?? "").trim(),
      email: (row[emailIndex] ?? "").trim(),
    }))
    .filter((row) => row.name !== "" || row.email !== "")
}

function parseCsvText(text: string): ParsedUserRow[] {
  const lines = text
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)

  if (lines.length === 0) {
    throw new Error("The file is empty.")
  }

  const headers = parseCsvLine(lines[0])
  const dataRows = lines.slice(1).map(parseCsvLine)

  const rows = rowsFromTable(headers, dataRows)
  if (rows.length === 0) {
    throw new Error("No valid rows found. Each row needs a name and email.")
  }

  return rows
}

async function parseExcelFile(file: File): Promise<ParsedUserRow[]> {
  try {
    const XLSX = await import("xlsx")
    const buffer = await file.arrayBuffer()
    const workbook = XLSX.read(buffer, { type: "array" })
    const sheetName = workbook.SheetNames[0]

    if (!sheetName) {
      throw new Error("The file is empty.")
    }

    const sheet = workbook.Sheets[sheetName]
    const matrix = XLSX.utils.sheet_to_json<string[]>(sheet, {
      header: 1,
      defval: "",
      raw: false,
    }) as string[][]

    if (matrix.length === 0) {
      throw new Error("No data rows found. Expected columns: Name, Email")
    }

    const headers = matrix[0].map((cell) => String(cell ?? ""))
    const dataRows = matrix.slice(1).map((row) => row.map((cell) => String(cell ?? "")))
    const rows = rowsFromTable(headers, dataRows)

    if (rows.length === 0) {
      throw new Error("No valid rows found. Each row needs a name and email.")
    }

    return rows
  } catch (error) {
    const message = error instanceof Error ? error.message : ""
    const moduleMissing =
      message.includes("Cannot find module") ||
      message.includes("Can't resolve") ||
      message.includes("xlsx")

    if (moduleMissing) {
      throw new Error(
        'Excel support requires the "xlsx" package. npm install failed on your PC (SSL error). Use a .csv file, or run: npm config set strict-ssl false && npm install xlsx'
      )
    }

    throw error
  }
}

export async function parseUserImportFile(file: File): Promise<ParsedUserRow[]> {
  const fileName = file.name.toLowerCase()
  const isCsv = fileName.endsWith(".csv") || file.type === "text/csv"
  const isExcel =
    fileName.endsWith(".xlsx") ||
    fileName.endsWith(".xls") ||
    file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
    file.type === "application/vnd.ms-excel"

  if (isCsv) {
    const text = await file.text()
    return parseCsvText(text)
  }

  if (isExcel) {
    return parseExcelFile(file)
  }

  throw new Error("Unsupported file type. Please upload a .csv or .xlsx file.")
}
