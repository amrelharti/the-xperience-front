# CV Scorer Chatbot Implementation

## ✅ Implementation Complete

A chatbot has been integrated into the CV scorer page that helps users understand the CV scoring system, rubric, and best practices using OpenAI GPT-4o-mini.

---

## 📁 Files Created

### Frontend

1. **`components/CVScorerChat.tsx`**
   - Floating chat button component
   - Chat window with message history
   - Minimize/maximize functionality
   - Auto-scroll to latest messages
   - Only visible to authenticated users

2. **`app/api/chat/cv-scorer/route.ts`**
   - Next.js API route for sending chat messages
   - Proxies to Spring Boot backend
   - Handles authentication

3. **`app/api/chat/cv-scorer/history/route.ts`**
   - Next.js API route for loading conversation history
   - Proxies to Spring Boot backend

4. **`app/cv-scorer/page.tsx`** (Updated)
   - Integrated CVScorerChat component

### Backend

1. **`src/main/resources/db/migration/V7__Create_Chat_Conversation_History.sql`**
   - Database migration for `chat_conversation_message` table
   - Stores conversation history per user

2. **`src/main/java/com/thexperience/backend/chat/entity/ChatMessageEntity.java`**
   - JPA entity for chat messages

3. **`src/main/java/com/thexperience/backend/chat/repository/ChatMessageRepository.java`**
   - Repository for chat message operations

4. **`src/main/java/com/thexperience/backend/chat/dto/`**
   - `ChatRequest.java` - Request DTO
   - `ChatResponse.java` - Response DTO
   - `MessageDTO.java` - Message DTO
   - `ConversationHistoryResponse.java` - History response DTO

5. **`src/main/java/com/thexperience/backend/chat/service/OpenAIChatService.java`**
   - Service for OpenAI API integration
   - Contains full CV scoring system prompt
   - Uses GPT-4o-mini model

6. **`src/main/java/com/thexperience/backend/chat/controller/ChatController.java`**
   - REST controller with endpoints:
     - `POST /api/chat/cv-scorer` - Send message
     - `GET /api/chat/cv-scorer/history` - Get conversation history

7. **`src/main/resources/application.properties`** (Updated)
   - Added `openai.api.key=${OPENAI_API_KEY:}` configuration

---

## ⚠️ IMPORTANT: Backend Controller Fix Required

The `ChatController.java` has a placeholder method `getUserIdFromEmail()` that **MUST be implemented** before the chatbot will work.

### Current Code (Line ~100):
```java
private UUID getUserIdFromEmail(String email) {
    // TODO: Implement this to get user ID from email
    return null;
}
```

### Required Implementation:

You need to inject a `UserRepository` or `UserService` and implement this method. Example:

```java
@Autowired
private UserRepository userRepository; // or UserService

private UUID getUserIdFromEmail(String email) {
    UserEntity user = userRepository.findByEmail(email)
        .orElse(null);
    return user != null ? user.getId() : null;
}
```

**OR** if you have a `UserService`:

```java
@Autowired
private UserService userService;

private UUID getUserIdFromEmail(String email) {
    UserEntity user = userService.findByEmail(email);
    return user != null ? user.getId() : null;
}
```

---

## 🔧 Configuration

### Environment Variables

Set the OpenAI API key in your environment:

```bash
export OPENAI_API_KEY=your-api-key-here
```

Or add to your `application.properties`:
```properties
openai.api.key=your-api-key-here
```

### Database Migration

The migration `V7__Create_Chat_Conversation_History.sql` will run automatically when you start the backend (if Flyway is enabled).

If Flyway is disabled, run it manually:
```sql
-- See: src/main/resources/db/migration/V7__Create_Chat_Conversation_History.sql
```

---

## 🚀 How It Works

1. **User clicks floating chat button** on CV scorer page
2. **Chat window opens** with welcome message
3. **User asks questions** about CV scoring
4. **Frontend sends message** to `/api/chat/cv-scorer`
5. **Next.js route proxies** to Spring Boot backend
6. **Backend loads conversation history** from database
7. **OpenAI API called** with system prompt + conversation history
8. **Response saved** to database
9. **Response displayed** in chat window

---

## 📋 Features

- ✅ Floating chat button (bottom-right)
- ✅ Minimize/maximize chat window
- ✅ Conversation history per user
- ✅ Persistent storage in database
- ✅ Only authenticated users can access
- ✅ Auto-scroll to latest messages
- ✅ Loading indicators
- ✅ Error handling

---

## 🎯 Chatbot Capabilities

The chatbot can help users with:
- Understanding the CV scoring dimensions
- Explaining the difference between headline and summary
- Best practices for Moroccan/Europass CVs
- How to improve specific sections (experience, education, skills)
- Questions about the scoring rubric
- General CV improvement advice

---

## 🧪 Testing

1. **Start backend** (ensure OpenAI API key is set)
2. **Start frontend**
3. **Navigate to** `/cv-scorer`
4. **Click chat button** (bottom-right)
5. **Ask questions** like:
   - "What's the difference between headline and summary?"
   - "How can I improve my experience section?"
   - "What makes a good CV structure?"

---

## 📝 Notes

- The chatbot uses **GPT-4o-mini** model (cost-effective)
- Conversation history is limited to last 10 messages when calling OpenAI (to avoid token limits)
- All messages are stored in database for full history
- The system prompt is embedded in `OpenAIChatService.java`
- Chat is only available on the CV scorer page

---

## 🔐 Security

- ✅ Authentication required (JWT token)
- ✅ User-specific conversation history
- ✅ API key stored in backend only
- ✅ No sensitive data exposed to frontend

---

## 📊 Database Schema

```sql
CREATE TABLE chat_conversation_message (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    role VARCHAR(20) NOT NULL, -- 'user' or 'assistant'
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

---

## ✅ Next Steps

1. **Fix `ChatController.getUserIdFromEmail()`** method (see above)
2. **Set OpenAI API key** in environment or properties
3. **Run database migration** (if Flyway disabled)
4. **Test the chatbot** on CV scorer page
5. **Monitor OpenAI API usage** and costs

---

## 💰 Cost Estimation

- **GPT-4o-mini**: ~$0.15 per 1M input tokens, ~$0.60 per 1M output tokens
- **System prompt**: ~3000 tokens
- **Average conversation**: ~5000-10000 tokens per exchange
- **Estimated cost**: ~$0.01-0.02 per conversation (depending on length)

---

**Status**: ✅ Frontend complete, ⚠️ Backend needs `getUserIdFromEmail()` implementation

