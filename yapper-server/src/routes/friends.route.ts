import { Router } from "express";
import requireSession from "../middleware/session.middleware.js";
import { getFriends, createFriendship, getFriendRequests, createFriendRequest, deleteFriendRequest, acceptFriendRequest, deleteFriendship, searchUsers} from "../controllers/friends.controller.js";

const router = Router()


router.get('/', requireSession, getFriends)

router.post('/', requireSession, createFriendship)

router.get('/friend_requests', requireSession, getFriendRequests)

router.post('/friend_requests', requireSession, createFriendRequest)

router.delete('/friend_requests', requireSession, deleteFriendRequest)

router.post('/friendships', requireSession, acceptFriendRequest)

router.delete('/friendships', requireSession, deleteFriendship)

router.get('/users', searchUsers)

export default router