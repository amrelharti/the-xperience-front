"use client"

import { useState, useEffect, useRef } from "react"
import { CheckCircle2, ArrowRight, PlayCircle, Users, Target, FileText, Linkedin, MessageSquare, Calendar, ChevronDown, Instagram, Award, TrendingUp, Clock, Sparkles, Menu, X, Star, Quote } from "lucide-react"

type Language = "en" | "fr"

interface Content {
  header: {
    logo: string
    nav: {
      program: string
      forWho: string
      price: string
      faq: string
    }
  }
  hero: {
    headline: string
    subheading: string
    forWho: string
    ctaPrimary: string
    ctaSecondary: string
  }
  socialProof: {
    title: string
    stats: {
      number: string
      label: string
    }[]
  }
  problem: {
    title: string
    reasons: {
      number: string
      title: string
      description: string
    }[]
  }
  trainer: {
    title: string
    name: string
    role: string
    bio: string[]
    stats: {
      label: string
      value: string
    }[]
    social: {
      instagram: string
      linkedin: string
    }
  }
  transformation: {
    title: string
    points: string[]
  }
  modules: {
    title: string
    items: {
      title: string
      description: string
    }[]
  }
  platform: {
    title: string
    points: string[]
  }
  whoItsFor: {
    title: string
    points: string[]
  }
  price: {
    title: string
    plans: {
      basic: {
        name: string
        originalPrice: string
        currentPrice: string
        features: string[]
      }
      premium: {
        name: string
        originalPrice: string
        currentPrice: string
        specialOffer: string
        features: string[]
      }
    }
  }
  faq: {
    title: string
    items: {
      question: string
      answer: string
    }[]
  }
  testimonials: {
    title: string
    items: {
      name: string
      role: string
      text: string
      rating: number
    }[]
  }
  form: {
    title: string
    subtitle: string
    fields: {
      fullName: string
      phone: string
      lookingFor: string
      offer: string
      submit: string
    }
    lookingForOptions: {
      stagePFE: string
      premierEmploi: string
      progresserCarriere: string
      reconversion: string
    }
    offerOptions: {
      xperiencePro: string
      xperience: string
    }
  }
}

const content: Record<Language, Content> = {
  en: {
    header: {
      logo: "Xperience Pro",
      nav: {
        program: "Program",
        forWho: "For Who?",
        price: "Price",
        faq: "FAQ",
      },
    },
    hero: {
      headline: "Xperience Pro: Stop applying in the dark. Start getting real interviews.",
      subheading: "A step-by-step program to build a winning CV, adapt it to each job, master LinkedIn, and feel confident in interviews.",
      forWho: "For students, employees, and job seekers who are tired of sending CVs and getting no answers.",
      ctaPrimary: "Join Xperience Pro",
      ctaSecondary: "See what's inside",
    },
    socialProof: {
      title: "Proven Method",
      stats: [
        { number: "+5000", label: "candidates accompanied" },
        { number: "92%", label: "reached their professional goals" },
        { number: "80%", label: "did it in less than 3 months" },
      ],
    },
    problem: {
      title: "3 reasons why you don't reach your professional goals",
      reasons: [
        {
          number: "01",
          title: "You don't use the right tools (including AI) to adapt your CV to job offers",
          description: "Generic CV with no keywords, not attractive to recruiters.",
        },
        {
          number: "02",
          title: "You don't know how to handle interviews like a pro",
          description: "Your answers are not structured and not convincing.",
        },
        {
          number: "03",
          title: "You don't prepare in advance to seize opportunities",
          description: "Great opportunities pass by and you end up accepting a job you don't really want.",
        },
      ],
    },
    trainer: {
      title: "Meet your coach",
      name: "Ali El Harti",
      role: "Certified Trainer & Employability Manager",
      bio: [
        "Certified trainer with 7+ years of experience helping young people prepare for the job market.",
        "Specializes in job and internship search techniques.",
        "More than 5000 people have benefited from his career coaching.",
        "Has spoken in over 100 conferences in Morocco and internationally.",
        "Works as an Employability Manager and collaborates with several well-known universities in Morocco, focusing on company relations and industrial partnerships.",
        "Has been invited by major media such as Al Aoula, Le Matin, and M24.",
      ],
      stats: [
        { label: "Years of Experience", value: "7+" },
        { label: "People Coached", value: "5000+" },
        { label: "Conferences", value: "100+" },
      ],
      social: {
        instagram: "https://www.instagram.com/alielharti_ma/", // TODO: Update with actual Instagram URL
        linkedin: "https://linkedin.com/in/ali-el-harti", // TODO: Update with actual LinkedIn URL
      },
    },
    transformation: {
      title: "What you'll be able to do after Xperience Pro",
      points: [
        "Create a clear, professional CV that recruiters actually want to read.",
        "Quickly adapt your CV to each job without starting from scratch.",
        "Have a clean, attractive LinkedIn profile that works for you.",
        "Arrive to interviews prepared, with clear answers and smart questions.",
      ],
    },
    modules: {
      title: "What's inside Xperience Pro",
      items: [
        {
          title: "Module 1 – CV fundamentals",
          description: "Build a CV that looks professional and clearly shows your value, even if you don't have a lot of experience.",
        },
        {
          title: "Module 2 – Adapting your CV to each job",
          description: "How to read a job offer, pick the right keywords, and adapt your CV fast.",
        },
        {
          title: "Module 3 – Mastering LinkedIn",
          description: "Optimize your photo, headline, About section, and start being visible to recruiters.",
        },
        {
          title: "Module 4 – Interview preparation",
          description: "How to introduce yourself, answer classic questions, and ask smart questions at the end.",
        },
        {
          title: "Module 5 – Action plan",
          description: "A 30-day action plan to apply, follow up, and track your progress without feeling lost.",
        },
      ],
    },
    platform: {
      title: "Learn on a simple, 24/7 online platform",
      points: [
        "All lessons are available on an online platform.",
        "Short videos, practical exercises, and progress tracking.",
      ],
    },
    whoItsFor: {
      title: "Xperience Pro is for you if…",
      points: [
        "You're a student, employee, or job seeker.",
        "You're tired of sending CVs and hearing nothing back.",
        "You want a clear structure instead of random YouTube videos.",
      ],
    },
    price: {
      title: "Choose Your Plan",
      plans: {
        basic: {
          name: "COACHING BASIC",
          originalPrice: "1000 DH",
          currentPrice: "700 DH",
          features: [
            "Access to a single module of the program. You choose between:",
            "Mastered interview techniques",
            "Professional CV",
            "Personal branding and analysis of offers on LinkedIn",
          ],
        },
        premium: {
          name: "COACHING PREMIUM",
          originalPrice: "1500 DH",
          currentPrice: "999 DH",
          specialOffer: "SPECIAL OFFER",
          features: [
            "Access to all modules of the program:",
            "Professional CV",
            "Mastered interview techniques",
            "Personal branding and analysis of offers on LinkedIn",
            "Free ebooks and resources",
            "Regular WhatsApp follow-up",
            "1 month of training: 4 live sessions and 18 recorded capsules",
          ],
        },
      },
    },
    faq: {
      title: "Frequently Asked Questions",
      items: [
        {
          question: "How do I access the program after payment?",
          answer: "After payment, you'll receive an email with your login credentials and access to the online platform within 24 hours.",
        },
        {
          question: "Is it suitable for beginners?",
          answer: "Yes! Xperience Pro is designed for everyone, whether you're just starting your career or looking to make a change. No prior experience needed.",
        },
        {
          question: "How long do I keep access?",
          answer: "You get lifetime access to all the content. Once you join, you can revisit the lessons anytime, anywhere.",
        },
        {
          question: "What if I'm not satisfied?",
          answer: "We're confident you'll love the program. If you're not satisfied within the first 7 days, contact us for a full refund.",
        },
        {
          question: "Can I access it on mobile?",
          answer: "Yes! The platform is fully responsive and works perfectly on your phone, tablet, or computer.",
        },
      ],
    },
    testimonials: {
      title: "What our students say",
      items: [
        {
          name: "Sarah M.",
          role: "Recent Graduate",
          text: "Xperience Pro completely transformed my job search. I went from zero responses to multiple interviews in just 2 months. The CV adaptation techniques are game-changers!",
          rating: 5,
        },
        {
          name: "Ahmed K.",
          role: "Career Changer",
          text: "I was stuck in a job I didn't like. This program gave me the confidence and tools to make a successful career transition. The interview preparation module is excellent.",
          rating: 5,
        },
        {
          name: "Fatima L.",
          role: "Student",
          text: "As a student with no experience, I thought finding an internship would be impossible. Xperience Pro showed me how to highlight my skills and I got 3 internship offers!",
          rating: 5,
        },
        {
          name: "Youssef B.",
          role: "Job Seeker",
          text: "The LinkedIn optimization tips alone are worth the investment. I started getting messages from recruiters within weeks. Highly recommend!",
          rating: 5,
        },
      ],
    },
    form: {
      title: "Join Xperience Pro",
      subtitle: "Fill out the form and we'll contact you via WhatsApp",
      fields: {
        fullName: "Full Name",
        phone: "Phone Number",
        lookingFor: "What are you looking for?",
        offer: "Which offer interests you?",
        submit: "Send via WhatsApp",
      },
      lookingForOptions: {
        stagePFE: "Stage PFE",
        premierEmploi: "Premier Emploi",
        progresserCarriere: "Progresser ma carrière",
        reconversion: "Reconversion Professionnelle",
      },
      offerOptions: {
        xperiencePro: "COACHING PREMIUM - 999 DH",
        xperience: "COACHING BASIC - 700 DH",
      },
    },
  },
  fr: {
    header: {
      logo: "Xperience Pro",
      nav: {
        program: "Programme",
        forWho: "Pour qui ?",
        price: "Prix",
        faq: "FAQ",
      },
    },
    hero: {
      headline: "Xperience Pro : Arrête de postuler dans le vide. Commence à décrocher de vrais entretiens.",
      subheading: "Un programme étape par étape pour créer un CV qui donne envie de te rencontrer, l'adapter à chaque offre, maîtriser LinkedIn et arriver préparé(e) en entretien.",
      forWho: "Pour les étudiants, salariés et personnes en recherche d'emploi qui en ont marre d'envoyer des CV sans aucune réponse.",
      ctaPrimary: "Rejoindre Xperience Pro – 1000 DH",
      ctaSecondary: "Découvrir le programme",
    },
    socialProof: {
      title: "Méthode éprouvée",
      stats: [
        { number: "+5000", label: "candidats accompagnés" },
        { number: "92%", label: "ont atteint leurs objectifs professionnels" },
        { number: "80%", label: "l'ont fait en moins de 3 mois" },
      ],
    },
    problem: {
      title: "3 raisons pour lesquelles tu n'atteins pas tes objectifs professionnels",
      reasons: [
        {
          number: "01",
          title: "Tu n'utilises pas les bons outils (dont l'IA) pour adapter ton CV aux offres d'emploi",
          description: "CV générique, sans mots-clés, qui n'attire pas l'attention du recruteur.",
        },
        {
          number: "02",
          title: "Tu ne sais pas comment gérer ton entretien comme un pro",
          description: "Tes réponses sont mal structurées, peu convaincantes.",
        },
        {
          number: "03",
          title: "Tu ne te prépares pas à l'avance pour saisir les opportunités",
          description: "Les bonnes opportunités te passent sous le nez et tu te contentes d'un job qui ne t'intéresse pas.",
        },
      ],
    },
    trainer: {
      title: "Préparez-vous au marché d'emploi avec notre expert",
      name: "Ali El Harti",
      role: "Formateur Certifié & Responsable Employabilité",
      bio: [
        "Formateur certifié avec plus de 7 ans d'expérience dans l'accompagnement des jeunes vers le marché de l'emploi.",
        "Spécialisé dans les techniques de recherche d'emploi et de stage.",
        "Plus de 5000 personnes ont bénéficié de son coaching de carrière.",
        "A animé plus de 100 conférences au Maroc et à l'international.",
        "Travaille en tant que Responsable Employabilité et collabore avec plusieurs universités reconnues au Maroc, axé sur les relations entreprises et partenariats industriels.",
        "A été invité par les grands médias tels qu'Al Aoula, Le Matin et M24.",
      ],
      stats: [
        { label: "Années d'expérience", value: "7+" },
        { label: "Personnes coachées", value: "5000+" },
        { label: "Conférences", value: "100+" },
      ],
      social: {
        instagram: "https://www.instagram.com/alielharti_ma/", // TODO: Update with actual Instagram URL
        linkedin: "https://linkedin.com/in/ali-el-harti", // TODO: Update with actual LinkedIn URL
      },
    },
    transformation: {
      title: "Ce que tu seras capable de faire après Xperience Pro",
      points: [
        "Construire un CV clair et professionnel que les recruteurs ont envie de lire.",
        "Adapter ton CV à chaque offre sans tout recommencer à zéro.",
        "Avoir un profil LinkedIn propre et attractif qui travaille pour toi.",
        "Arriver en entretien préparé(e), avec des réponses claires et des questions intelligentes.",
      ],
    },
    modules: {
      title: "Le contenu du programme Xperience Pro",
      items: [
        {
          title: "Module 1 – Les fondamentaux du CV",
          description: "Construire un CV professionnel qui met en valeur ton profil, même si tu n'as pas beaucoup d'expérience.",
        },
        {
          title: "Module 2 – Adapter ton CV à chaque offre",
          description: "Comment lire une offre, choisir les bons mots-clés et adapter ton CV rapidement.",
        },
        {
          title: "Module 3 – Maîtriser LinkedIn",
          description: "Optimiser ta photo, ton titre, ton 'À propos' et devenir visible pour les recruteurs.",
        },
        {
          title: "Module 4 – Préparation aux entretiens",
          description: "Comment te présenter, répondre aux questions classiques et poser des questions intelligentes en fin d'entretien.",
        },
        {
          title: "Module 5 – Plan d'action",
          description: "Un plan d'action sur 30 jours pour postuler, relancer et suivre tes candidatures sans te perdre.",
        },
      ],
    },
    platform: {
      title: "Une plateforme simple, accessible 24h/24",
      points: [
        "Tous les modules sont disponibles sur une plateforme en ligne.",
        "Vidéos courtes, exercices pratiques et suivi de progression.",
      ],
    },
    whoItsFor: {
      title: "Xperience Pro est fait pour toi si…",
      points: [
        "Tu es étudiant(e), salarié(e) ou en recherche d'emploi.",
        "Tu en as marre d'envoyer des CV sans réponse.",
        "Tu veux un cadre clair au lieu de vidéos YouTube au hasard.",
      ],
    },
    price: {
      title: "Choisissez votre formule",
      plans: {
        basic: {
          name: "COACHING BASIC",
          originalPrice: "1000 DH",
          currentPrice: "700 DH",
          features: [
            "Accès à un seul module du programme. Tu choisis entre:",
            "Techniques d'entretien maîtrisées",
            "CV professionnel",
            "Personal branding et analyse des offres sur LinkedIn",
          ],
        },
        premium: {
          name: "COACHING PREMIUM",
          originalPrice: "1500 DH",
          currentPrice: "999 DH",
          specialOffer: "OFFRE SPÉCIALE",
          features: [
            "Accès à l'ensemble des modules du programme:",
            "CV professionnel",
            "Techniques d'entretien maîtrisées",
            "Personal branding et analyse des offres sur LinkedIn",
            "Ebooks et ressources gratuites",
            "Suivi régulier sur Whatsapp",
            "1 mois de formation: 4 séances live et 18 capsules enregistrées",
          ],
        },
      },
    },
    faq: {
      title: "Questions fréquentes",
      items: [
        {
          question: "Comment j'accède au programme après le paiement ?",
          answer: "Après le paiement, tu recevras un email avec tes identifiants de connexion et l'accès à la plateforme en ligne sous 24 heures.",
        },
        {
          question: "Est-ce adapté aux débutants ?",
          answer: "Oui ! Xperience Pro est conçu pour tout le monde, que tu commences ta carrière ou que tu veuilles changer. Aucune expérience préalable nécessaire.",
        },
        {
          question: "Combien de temps je garde l'accès ?",
          answer: "Tu as un accès à vie à tout le contenu. Une fois inscrit(e), tu peux revoir les leçons quand tu veux, où tu veux.",
        },
        {
          question: "Et si je ne suis pas satisfait(e) ?",
          answer: "Nous sommes confiants que tu vas adorer le programme. Si tu n'es pas satisfait(e) dans les 7 premiers jours, contacte-nous pour un remboursement complet.",
        },
        {
          question: "Je peux y accéder sur mobile ?",
          answer: "Oui ! La plateforme est entièrement responsive et fonctionne parfaitement sur ton téléphone, tablette ou ordinateur.",
        },
      ],
    },
    testimonials: {
      title: "Ce que disent nos étudiants",
      items: [
        {
          name: "Sarah M.",
          role: "Diplômée récente",
          text: "Xperience Pro a complètement transformé ma recherche d'emploi. Je suis passée de zéro réponse à plusieurs entretiens en seulement 2 mois. Les techniques d'adaptation de CV sont révolutionnaires !",
          rating: 5,
        },
        {
          name: "Ahmed K.",
          role: "Reconversion professionnelle",
          text: "J'étais coincé dans un job qui ne me plaisait pas. Ce programme m'a donné la confiance et les outils pour faire une transition de carrière réussie. Le module de préparation aux entretiens est excellent.",
          rating: 5,
        },
        {
          name: "Fatima L.",
          role: "Étudiante",
          text: "En tant qu'étudiante sans expérience, je pensais que trouver un stage serait impossible. Xperience Pro m'a montré comment mettre en valeur mes compétences et j'ai reçu 3 offres de stage !",
          rating: 5,
        },
        {
          name: "Youssef B.",
          role: "Demandeur d'emploi",
          text: "Les conseils d'optimisation LinkedIn à eux seuls valent l'investissement. J'ai commencé à recevoir des messages de recruteurs en quelques semaines. Je recommande vivement !",
          rating: 5,
        },
      ],
    },
    form: {
      title: "Rejoindre Xperience Pro",
      subtitle: "Remplissez le formulaire et nous vous contacterons via WhatsApp",
      fields: {
        fullName: "Nom complet",
        phone: "Numéro de téléphone",
        lookingFor: "Que recherchez-vous ?",
        offer: "Quelle offre vous intéresse ?",
        submit: "Envoyer via WhatsApp",
      },
      lookingForOptions: {
        stagePFE: "Stage PFE",
        premierEmploi: "Premier Emploi",
        progresserCarriere: "Progresser ma carrière",
        reconversion: "Reconversion Professionnelle",
      },
      offerOptions: {
        xperiencePro: "COACHING PREMIUM - 999 DH",
        xperience: "COACHING BASIC - 700 DH",
      },
    },
  },
}

export default function XperienceProLandingPage() {
  const [language, setLanguage] = useState<Language>("en")
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null)
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set())
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    lookingFor: "",
    offer: "",
  })
  const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({})
  
  // WhatsApp number - Clean format: only digits, country code + number (e.g., 212773213060)
  const ADMIN_WHATSAPP_NUMBER = "212773213060"

  const t = content[language]

  useEffect(() => {
    const observers: IntersectionObserver[] = []

    Object.keys(sectionRefs.current).forEach((key) => {
      const element = sectionRefs.current[key]
      if (element) {
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                setVisibleSections((prev) => new Set(prev).add(key))
              }
            })
          },
          { threshold: 0.1 }
        )
        observer.observe(element)
        observers.push(observer)
      }
    })

    return () => {
      observers.forEach((observer) => observer.disconnect())
    }
  }, [])

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" })
      setMobileMenuOpen(false)
    }
  }

  // Clean phone number - remove all non-digit characters
  const cleanPhoneNumber = (phone: string): string => {
    return phone.replace(/\D/g, "")
  }

  // Format WhatsApp number - ensure it's clean and properly formatted
  const formatWhatsAppNumber = (phone: string): string => {
    const cleaned = cleanPhoneNumber(phone)
    // If it starts with +, remove it
    // If it starts with 00, replace with country code
    if (cleaned.startsWith("00212")) {
      return cleaned.replace("00212", "212")
    }
    // If it starts with 0, replace with country code
    if (cleaned.startsWith("0")) {
      return "212" + cleaned.substring(1)
    }
    // If it already has country code, return as is
    if (cleaned.startsWith("212")) {
      return cleaned
    }
    // Otherwise, assume it's a local number and add country code
    return "212" + cleaned
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const t = content[language]
    const lookingForText = formData.lookingFor === "stagePFE" 
      ? t.form.lookingForOptions.stagePFE
      : formData.lookingFor === "premierEmploi"
      ? t.form.lookingForOptions.premierEmploi
      : formData.lookingFor === "progresserCarriere"
      ? t.form.lookingForOptions.progresserCarriere
      : t.form.lookingForOptions.reconversion

    const message = language === "en"
      ? `Hi, my name is ${formData.fullName} and I'm looking for ${lookingForText}. I chose this offer: ${formData.offer}. My phone number is ${formData.phone}.`
      : `Bonjour, je m'appelle ${formData.fullName} et je recherche ${lookingForText}. J'ai choisi cette offre : ${formData.offer}. Mon numéro de téléphone est ${formData.phone}.`

    // Clean and format the WhatsApp number - ensure only digits
    let cleanedNumber = cleanPhoneNumber(ADMIN_WHATSAPP_NUMBER)
    
    // For WhatsApp Business, ensure proper format
    // Remove leading + or 00 if present
    if (cleanedNumber.startsWith("00212")) {
      cleanedNumber = cleanedNumber.replace("00212", "212")
    }
    if (cleanedNumber.startsWith("+212")) {
      cleanedNumber = cleanedNumber.replace("+212", "212")
    }
    // Remove leading 0 if country code is missing
    if (cleanedNumber.startsWith("0") && !cleanedNumber.startsWith("212")) {
      cleanedNumber = "212" + cleanedNumber.substring(1)
    }
    // Ensure it starts with country code
    if (!cleanedNumber.startsWith("212")) {
      cleanedNumber = "212" + cleanedNumber
    }
    
    // Validate number format
    if (cleanedNumber.length < 10 || cleanedNumber.length > 15) {
      alert(language === "en" 
        ? "Invalid phone number format. Please check the WhatsApp number configuration."
        : "Format de numéro invalide. Veuillez vérifier la configuration du numéro WhatsApp.")
      return
    }
    
    // Encode the message for URL
    const encodedMessage = encodeURIComponent(message)
    
    // Try multiple WhatsApp URL formats for business numbers
    // Primary: wa.me (works for both personal and business)
    const whatsappUrl1 = `https://wa.me/${cleanedNumber}?text=${encodedMessage}`
    
    // Alternative: api.whatsapp.com (sometimes works better for business)
    const whatsappUrl2 = `https://api.whatsapp.com/send?phone=${cleanedNumber}&text=${encodedMessage}`
    
    // Try primary format first, with fallback
    try {
      const win = window.open(whatsappUrl1, "_blank", "noopener,noreferrer")
      // If window didn't open (blocked), try alternative
      if (!win || win.closed || typeof win.closed === "undefined") {
        setTimeout(() => {
          window.open(whatsappUrl2, "_blank", "noopener,noreferrer")
        }, 100)
      }
    } catch (error) {
      // Fallback to alternative format
      window.open(whatsappUrl2, "_blank", "noopener,noreferrer")
    }
    
    // Reset form
    setFormData({
      fullName: "",
      phone: "",
      lookingFor: "",
      offer: "",
    })
    setShowForm(false)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-[#005eb8] to-[#0476D7] bg-clip-text text-transparent">
                {t.header.logo}
              </h1>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <button
                onClick={() => scrollToSection("program")}
                className="text-gray-700 hover:text-[#005eb8] transition-colors font-medium"
              >
                {t.header.nav.program}
              </button>
              <button
                onClick={() => scrollToSection("for-who")}
                className="text-gray-700 hover:text-[#005eb8] transition-colors font-medium"
              >
                {t.header.nav.forWho}
              </button>
              <button
                onClick={() => scrollToSection("price")}
                className="text-gray-700 hover:text-[#005eb8] transition-colors font-medium"
              >
                {t.header.nav.price}
              </button>
              <button
                onClick={() => scrollToSection("testimonials")}
                className="text-gray-700 hover:text-[#005eb8] transition-colors font-medium"
              >
                {language === "en" ? "Testimonials" : "Témoignages"}
              </button>
              <button
                onClick={() => scrollToSection("faq")}
                className="text-gray-700 hover:text-[#005eb8] transition-colors font-medium"
              >
                {t.header.nav.faq}
              </button>
            </nav>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setLanguage("en")}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  language === "en"
                    ? "bg-[#005eb8] text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage("fr")}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  language === "fr"
                    ? "bg-[#005eb8] text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                FR
              </button>
              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden ml-2 p-2 text-gray-700 hover:text-[#005eb8] transition-colors"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
          
          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 py-4">
              <nav className="flex flex-col space-y-3">
                <button
                  onClick={() => scrollToSection("program")}
                  className="text-left px-4 py-2 text-gray-700 hover:text-[#005eb8] hover:bg-gray-50 rounded-md transition-colors font-medium"
                >
                  {t.header.nav.program}
                </button>
                <button
                  onClick={() => scrollToSection("for-who")}
                  className="text-left px-4 py-2 text-gray-700 hover:text-[#005eb8] hover:bg-gray-50 rounded-md transition-colors font-medium"
                >
                  {t.header.nav.forWho}
                </button>
                <button
                  onClick={() => scrollToSection("price")}
                  className="text-left px-4 py-2 text-gray-700 hover:text-[#005eb8] hover:bg-gray-50 rounded-md transition-colors font-medium"
                >
                  {t.header.nav.price}
                </button>
                <button
                  onClick={() => scrollToSection("testimonials")}
                  className="text-left px-4 py-2 text-gray-700 hover:text-[#005eb8] hover:bg-gray-50 rounded-md transition-colors font-medium"
                >
                  {language === "en" ? "Testimonials" : "Témoignages"}
                </button>
                <button
                  onClick={() => scrollToSection("faq")}
                  className="text-left px-4 py-2 text-gray-700 hover:text-[#005eb8] hover:bg-gray-50 rounded-md transition-colors font-medium"
                >
                  {t.header.nav.faq}
                </button>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#005eb8] via-[#0476D7] to-[#0068A7] text-white py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.05) 10px, rgba(255,255,255,0.05) 20px)'
          }}></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              {t.hero.headline}
            </h1>
            <p className="text-xl md:text-2xl mb-6 text-blue-100 leading-relaxed">
              {t.hero.subheading}
            </p>
            <p className="text-lg mb-8 text-blue-200">
              {t.hero.forWho}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={() => scrollToSection("price")}
                className="bg-[#FFBC00] hover:bg-[#e6a800] text-gray-900 font-bold px-8 py-4 rounded-lg text-lg shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
              >
                {t.hero.ctaPrimary}
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => scrollToSection("program")}
                className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-semibold px-8 py-4 rounded-lg text-lg border-2 border-white/30 transition-all duration-200 flex items-center gap-2"
              >
                {t.hero.ctaSecondary}
                <PlayCircle className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-12 md:py-16 bg-white border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 text-gray-900">
            {t.socialProof.title}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {t.socialProof.stats.map((stat, index) => (
              <div
                key={index}
                ref={(el) => {
                  sectionRefs.current[`stat-${index}`] = el
                }}
                className={`bg-gradient-to-br from-[#005eb8] to-[#0476D7] p-8 rounded-2xl shadow-xl text-white text-center transform transition-all duration-700 ${
                  visibleSections.has(`stat-${index}`)
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-10"
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="text-5xl md:text-6xl font-bold mb-2 text-[#FFBC00]">
                  {stat.number}
                </div>
                <div className="text-lg md:text-xl font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
              {t.problem.title}
            </h2>
            <div className="space-y-6">
              {t.problem.reasons.map((reason, index) => (
                <div
                  key={index}
                  ref={(el) => {
                    sectionRefs.current[`problem-${index}`] = el
                  }}
                  className={`bg-white p-8 rounded-xl shadow-lg border-l-4 border-red-500 transform transition-all duration-700 ${
                    visibleSections.has(`problem-${index}`)
                      ? "opacity-100 translate-x-0"
                      : "opacity-0 -translate-x-10"
                  }`}
                  style={{ transitionDelay: `${index * 150}ms` }}
                >
                  <div className="flex items-start gap-6">
                    <div className="flex-shrink-0">
                      <div className="bg-red-500 text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold">
                        {reason.number}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
                        {reason.title}
                      </h3>
                      <p className="text-lg text-gray-600 leading-relaxed">{reason.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Trainer Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
              {t.trainer.title}
            </h2>
            <div
              ref={(el) => {
                sectionRefs.current["trainer"] = el
              }}
              className={`bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-700 ${
                visibleSections.has("trainer") ? "opacity-100 scale-100" : "opacity-0 scale-95"
              }`}
            >
              <div className="md:flex">
                <div className="md:w-1/3 bg-gradient-to-br from-[#005eb8] to-[#0476D7] p-8 md:p-12 text-white flex flex-col items-center justify-center">
                  <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center mb-6 border-4 border-white/30">
                    <Users className="w-16 h-16 text-white" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold mb-2">{t.trainer.name}</h3>
                  <p className="text-blue-200 text-center mb-6">{t.trainer.role}</p>
                  <div className="flex gap-4">
                    <a
                      href={t.trainer.social.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white/20 hover:bg-white/30 rounded-full p-3 transition-all duration-200 transform hover:scale-110"
                    >
                      <Instagram className="w-6 h-6" />
                    </a>
                    <a
                      href={t.trainer.social.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white/20 hover:bg-white/30 rounded-full p-3 transition-all duration-200 transform hover:scale-110"
                    >
                      <Linkedin className="w-6 h-6" />
                    </a>
                  </div>
                </div>
                <div className="md:w-2/3 p-8 md:p-12">
                  <div className="grid grid-cols-3 gap-4 mb-8">
                    {t.trainer.stats.map((stat, index) => (
                      <div key={index} className="text-center">
                        <div className="text-3xl font-bold text-[#005eb8] mb-1">{stat.value}</div>
                        <div className="text-sm text-gray-600">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-4">
                    {t.trainer.bio.map((paragraph, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-[#005eb8] mt-1 flex-shrink-0" />
                        <p className="text-gray-700 leading-relaxed">{paragraph}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Transformation Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
              {t.transformation.title}
            </h2>
            <div className="space-y-4">
              {t.transformation.points.map((point, index) => (
                <div
                  key={index}
                  ref={(el) => {
                    sectionRefs.current[`transformation-${index}`] = el
                  }}
                  className={`bg-gradient-to-r from-[#005eb8] to-[#0476D7] p-6 rounded-lg shadow-lg text-white flex items-start gap-4 transform transition-all duration-700 ${
                    visibleSections.has(`transformation-${index}`)
                      ? "opacity-100 translate-x-0"
                      : "opacity-0 translate-x-10"
                  }`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <CheckCircle2 className="w-6 h-6 mt-1 flex-shrink-0 text-[#FFBC00]" />
                  <p className="text-lg flex-1">{point}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Modules Section */}
      <section id="program" className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
            {t.modules.title}
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {t.modules.items.map((module, index) => (
              <div
                key={index}
                ref={(el) => {
                  sectionRefs.current[`module-${index}`] = el
                }}
                className={`bg-white p-6 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 ${
                  visibleSections.has(`module-${index}`)
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-10"
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-[#005eb8] text-white rounded-full w-10 h-10 flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{module.title}</h3>
                </div>
                <p className="text-gray-600 leading-relaxed">{module.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-gray-900">
              {t.platform.title}
            </h2>
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-2xl shadow-lg">
              <div className="space-y-4">
                {t.platform.points.map((point, index) => (
                  <div key={index} className="flex items-center gap-3 text-left">
                    <CheckCircle2 className="w-6 h-6 text-[#005eb8] flex-shrink-0" />
                    <p className="text-lg text-gray-700">{point}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Who It's For Section */}
      <section id="for-who" className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
              {t.whoItsFor.title}
            </h2>
            <div className="space-y-4">
              {t.whoItsFor.points.map((point, index) => (
                <div
                  key={index}
                  className="bg-white p-6 rounded-lg shadow-md border-l-4 border-[#FFBC00] flex items-start gap-4"
                >
                  <Users className="w-6 h-6 text-[#005eb8] mt-1 flex-shrink-0" />
                  <p className="text-lg text-gray-700 flex-1">{point}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Price Section */}
      <section
        id="price"
        ref={(el) => {
          sectionRefs.current["price"] = el
        }}
        className="py-16 md:py-24 bg-white"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
            {t.price.title}
          </h2>
          <div className="grid md:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto">
            {/* Basic Plan Card */}
            <div
              className={`bg-white rounded-2xl shadow-xl border border-gray-200 p-8 transform transition-all duration-700 ${
                visibleSections.has("price") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
              }`}
            >
              <div className="text-center mb-6">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <span className="text-lg text-gray-500 line-through">{t.price.plans.basic.originalPrice}</span>
                </div>
                <div className="text-5xl md:text-6xl font-bold text-gray-900 mb-2">
                  {t.price.plans.basic.currentPrice}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mt-4">{t.price.plans.basic.name}</h3>
              </div>
              <ul className="space-y-3 mb-8">
                {t.price.plans.basic.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-gray-600 text-sm leading-relaxed">- {feature}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => {
                  setFormData({ ...formData, offer: t.form.offerOptions.xperience })
                  setShowForm(true)
                }}
                className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-4 px-6 rounded-lg text-lg shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                {language === "en" ? "Choose Basic" : "Choisir Basic"}
              </button>
            </div>

            {/* Premium Plan Card */}
            <div
              className={`bg-gradient-to-br from-[#005eb8] via-[#0476D7] to-[#0068A7] rounded-2xl shadow-xl border-2 border-[#FFBC00] p-8 transform transition-all duration-700 relative ${
                visibleSections.has("price") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
              }`}
              style={{ transitionDelay: "100ms" }}
            >
              {/* Special Offer Badge */}
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-[#FFBC00] text-gray-900 font-bold px-4 py-1 rounded-full text-sm shadow-lg">
                  {t.price.plans.premium.specialOffer}
                </span>
              </div>
              
              <div className="text-center mb-6 text-white">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <span className="text-lg text-blue-200 line-through">{t.price.plans.premium.originalPrice}</span>
                </div>
                <div className="text-5xl md:text-6xl font-bold text-[#FFBC00] mb-2">
                  {t.price.plans.premium.currentPrice}
                </div>
                <h3 className="text-2xl font-bold text-white mt-4">{t.price.plans.premium.name}</h3>
              </div>
              <ul className="space-y-3 mb-8 text-white">
                {t.price.plans.premium.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-white/90 text-sm leading-relaxed">- {feature}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => {
                  setFormData({ ...formData, offer: t.form.offerOptions.xperiencePro })
                  setShowForm(true)
                }}
                className="w-full bg-[#FFBC00] hover:bg-[#e6a800] text-gray-900 font-bold py-4 px-6 rounded-lg text-lg shadow-2xl transform hover:scale-105 transition-all duration-200"
              >
                {language === "en" ? "Choose Premium" : "Choisir Premium"}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
            {t.testimonials.title}
          </h2>
          <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
            {t.testimonials.items.map((testimonial, index) => (
              <div
                key={index}
                ref={(el) => {
                  sectionRefs.current[`testimonial-${index}`] = el
                }}
                className={`bg-gradient-to-br from-gray-50 to-blue-50 p-6 md:p-8 rounded-xl shadow-lg border border-gray-200 transform transition-all duration-700 ${
                  visibleSections.has(`testimonial-${index}`)
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-10"
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-[#FFBC00] text-[#FFBC00]" />
                  ))}
                </div>
                <Quote className="w-8 h-8 text-[#005eb8] mb-4 opacity-50" />
                <p className="text-gray-700 mb-6 leading-relaxed italic">
                  "{testimonial.text}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#005eb8] to-[#0476D7] rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
            {t.faq.title}
          </h2>
          <div className="space-y-4">
            {t.faq.items.map((item, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold text-gray-900 pr-4">{item.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-[#005eb8] flex-shrink-0 transition-transform ${
                      openFaqIndex === index ? "transform rotate-180" : ""
                    }`}
                  />
                </button>
                {openFaqIndex === index && (
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                    <p className="text-gray-700 leading-relaxed">{item.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-[#FFBC00] to-[#e6a800] bg-clip-text text-transparent">
            {t.header.logo}
          </h3>
          <p className="text-gray-400 mb-6">
            {language === "en"
              ? "Transform your job search. Get real results."
              : "Transforme ta recherche d'emploi. Obtiens de vrais résultats."}
          </p>
          <div className="flex justify-center gap-4">
            <a
              href={t.trainer.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors"
              aria-label="Instagram"
            >
              <Instagram className="w-6 h-6" />
            </a>
            <a
              href={t.trainer.social.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors"
              aria-label="LinkedIn"
            >
              <Linkedin className="w-6 h-6" />
            </a>
          </div>
        </div>
      </footer>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-gray-900">{t.form.title}</h3>
              <button
                onClick={() => {
                  setShowForm(false)
                  setFormData({ fullName: "", phone: "", lookingFor: "", offer: "" })
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleFormSubmit} className="p-6 space-y-6">
              <p className="text-gray-600 text-sm">{t.form.subtitle}</p>
              
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                  {t.form.fields.fullName} *
                </label>
                <input
                  type="text"
                  id="fullName"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#005eb8] focus:border-transparent outline-none transition-all"
                  placeholder={t.form.fields.fullName}
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  {t.form.fields.phone} *
                </label>
                <input
                  type="tel"
                  id="phone"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#005eb8] focus:border-transparent outline-none transition-all"
                  placeholder="+212 6XX XXX XXX"
                />
              </div>

              <div>
                <label htmlFor="lookingFor" className="block text-sm font-medium text-gray-700 mb-2">
                  {t.form.fields.lookingFor} *
                </label>
                <select
                  id="lookingFor"
                  required
                  value={formData.lookingFor}
                  onChange={(e) => setFormData({ ...formData, lookingFor: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#005eb8] focus:border-transparent outline-none transition-all bg-white"
                >
                  <option value="">{language === "en" ? "Select an option" : "Sélectionnez une option"}</option>
                  <option value="stagePFE">{t.form.lookingForOptions.stagePFE}</option>
                  <option value="premierEmploi">{t.form.lookingForOptions.premierEmploi}</option>
                  <option value="progresserCarriere">{t.form.lookingForOptions.progresserCarriere}</option>
                  <option value="reconversion">{t.form.lookingForOptions.reconversion}</option>
                </select>
              </div>

              <div>
                <label htmlFor="offer" className="block text-sm font-medium text-gray-700 mb-2">
                  {t.form.fields.offer} *
                </label>
                <select
                  id="offer"
                  required
                  value={formData.offer}
                  onChange={(e) => setFormData({ ...formData, offer: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#005eb8] focus:border-transparent outline-none transition-all bg-white"
                >
                  <option value="">{language === "en" ? "Select an offer" : "Sélectionnez une offre"}</option>
                  <option value={t.form.offerOptions.xperience}>{t.form.offerOptions.xperience}</option>
                  <option value={t.form.offerOptions.xperiencePro}>{t.form.offerOptions.xperiencePro}</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-[#FFBC00] hover:bg-[#e6a800] text-gray-900 font-bold px-6 py-4 rounded-lg text-lg shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-5 h-5" />
                {t.form.fields.submit}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

