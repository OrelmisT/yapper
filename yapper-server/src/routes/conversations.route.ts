import {Router} from 'express'
import requireSession from '../middleware/session.middleware.js'
import { getConversations, createConversation, getConversationMessages, updateLastReadTimestamp, createMessage, updateConversation, uploadImageUrls} from '../controllers/conversations.controller.js'

const router = Router()


router.get('/', requireSession, getConversations)

router.post('/', requireSession, createConversation)

router.get('/:conversationId/messages', requireSession, getConversationMessages)

router.put('/:conversationId/last_read', requireSession, updateLastReadTimestamp)

router.post('/:conversationId/messages', requireSession, createMessage)

router.put('/:conversationId', requireSession, updateConversation)

router.post(('/message_image_upload_urls'), requireSession, uploadImageUrls)




export default router