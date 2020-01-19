import ls from 'local-storage'
import { STORAGE_KEY } from '../helpers/constants.js'
import { BASE } from '../helpers/constants.js'
import * as api from '../api'

export const fetchForums = async server => {
  try {
    const fetchForums = await api.get(`${BASE}/forums.json`, server)
    return fetchForums
  } catch (e) {
    return { error: e.message }
  }
}

export const fetchForum = async forumId => {
  try {
    const fetchForum = await api.get(`${BASE}/forums/${forumId}.json`)
    return fetchForum
  } catch (e) {
    return { error: e.message }
  }
}

export const addForum = async detail => {
  try {
    const { idToken: token, email: poster } = ls(STORAGE_KEY)

    const forum = {
      name: detail.title,
      description: detail.message,
      posts: 0,
      topics: 0,
      creator: poster
    }

    const addForum = await api.post(`${BASE}/forums.json?auth=${token}`, forum)
    return { ...forum, id: addForum.name }
  } catch (e) {
    return { error: e.message }
  }
}

export const updateForum = async detail => {
  try {
    const { idToken: token } = ls(STORAGE_KEY)

    const updateForum = await api.patch(
      `${BASE}/forums/${detail.forumId}.json?auth=${token}`,
      {
        id: null,
        name: detail.title,
        description: detail.message
      }
    )
  } catch (e) {
    return { error: e.message }
  }
}

export const deleteForum = async forumId => {
  try {
    const { idToken: token } = ls(STORAGE_KEY)

    const fetchForum = await api.get(`${BASE}/forums/${forumId}.json`)
    const topicsId = fetchForum.topicsId

    if (topicsId) {
      for (let key in topicsId) {
        const topicId = topicsId[key]

        const fetchTopic = await api.get(`${BASE}/topics/${topicId}.json`)
        const postsId = fetchTopic.postsId

        for (let key in postsId) {
          const postId = postsId[key]
          await api.del(`${BASE}/posts/${postId}.json?auth=${token}`)
        }

        await api.del(`${BASE}/topics/${topicId}.json?auth=${token}`)
      }
    }
    await api.del(`${BASE}/forums/${forumId}.json?auth=${token}`)
  } catch (e) {
    return { error: e.message }
  }
}

export const fetchTopics = async (forumId, server) => {
  try {
    const fetchTopics = await api.get(
      `${BASE}/topics.json?orderBy="forumId"&equalTo="${forumId}"`,
      server
    )
    return fetchTopics
  } catch (e) {
    return { error: e.message }
  }
}

export const fetchTopic = async topicId => {
  try {
    const fetchTopic = await api.get(`${BASE}/topics/${topicId}.json`)
    return fetchTopic
  } catch (e) {
    return { error: e.message }
  }
}

export const addTopic = async (forumId, detail) => {
  try {
    const { idToken: token, email: poster } = ls(STORAGE_KEY)

    const now = new Date()
    const topic = {
      forumId,
      title: detail.title,
      content: detail.message,
      replies: 0,
      views: 0,
      createdDate: now,
      creator: poster,
      lastPostedDate: now,
      lastPoster: poster
    }

    const addTopic = await api.post(`${BASE}/topics.json?auth=${token}`, topic)
    topic.id = addTopic.name

    let fetchForum = await api.get(`${BASE}/forums/${forumId}.json`)

    const { topics, topicsId } = fetchForum
    if (topicsId) {
      topicsId.push(topic.id)

      await api.patch(`${BASE}/forums/${forumId}.json?auth=${token}`, {
        topics: topics + 1,
        topicsId
      })
    } else {
      await api.patch(`${BASE}/forums/${forumId}/topicsId.json?auth=${token}`, {
        0: topic.id
      })

      await api.patch(`${BASE}/forums/${forumId}.json?auth=${token}`, {
        topics: 1
      })
    }

    const post = {
      forumId,
      topicId: topic.id,
      title: detail.title,
      content: detail.message,
      creator: poster,
      createdDate: now,
      answered: false
    }

    const updateForumAndTopicId = await api.post(
      `${BASE}/posts.json?auth=${token}`,
      post
    )
    const postId = updateForumAndTopicId.name

    const fetchTopic = await api.get(`${BASE}/topics/${topic.id}.json`)
    const postsId = fetchTopic.postsId

    let index = 0
    if (postsId) index = postsId.length

    await api.patch(`${BASE}/topics/${topic.id}.json?auth=${token}`, {
      postsId: { [index]: postId }
    })

    fetchForum = await api.get(`${BASE}/forums/${forumId}.json`)

    const forum = {
      id: null,
      lastPost: detail.title,
      lastPostedDate: now,
      lastPoster: poster,
      lastTopicId: topic.id,
      posts: fetchForum.posts + 1
    }

    await api.patch(`${BASE}/forums/${forumId}.json?auth=${token}`, forum)
    return topic
  } catch (e) {
    return { error: e.message }
  }
}

export const updateTopic = async detail => {
  try {
    const { idToken: token } = ls(STORAGE_KEY)

    await api.patch(`${BASE}/topics/${detail.topicId}.json?auth=${token}`, {
      id: null,
      title: detail.title,
      content: detail.message
    })
  } catch (e) {
    return { error: e.message }
  }
}

export const updateTopicView = async topicId => {
  try {
    const { idToken: token } = ls(STORAGE_KEY)

    const fetchTopic = await api.get(`${BASE}/topics/${topicId}.json`)
    const views = fetchTopic.views

    await api.patch(`${BASE}/topics/${topicId}.json?auth=${token}`, {
      views: views + 1
    })
  } catch (e) {
    return { error: e.message }
  }
}

export const deleteTopic = async (forumId, topicId) => {
  try {
    const { idToken: token } = ls(STORAGE_KEY)

    const fetchTopic = await api.get(`${BASE}/topics/${topicId}.json`)
    const postsId = fetchTopic.postsId

    for (let key in postsId) {
      const postId = postsId[key]
      await api.del(`${BASE}/posts/${postId}.json?auth=${token}`)
    }

    await api.del(`${BASE}/topics/${topicId}.json?auth=${token}`)

    const fetchForum = await api.get(`${BASE}/forums/${forumId}.json`)
    const { posts, topics, topicsId } = fetchForum

    await api.patch(`${BASE}/forums/${forumId}.json?auth=${token}`, {
      posts: posts - postsId.length
    })
    const newTopicIds = topicsId.filter(t => t !== topicId)

    await api.patch(`${BASE}/forums/${forumId}.json?auth=${token}`, {
      topics: topics - 1,
      topicsId: newTopicIds
    })
  } catch (e) {
    return { error: e.message }
  }
}

export const fetchPosts = async (topicId, server) => {
  try {
    const fetchPosts = await api.get(
      `${BASE}/posts.json?orderBy="topicId"&equalTo="${topicId}"`,
      server
    )
    return fetchPosts
  } catch (e) {
    return { error: e.message }
  }
}

export const updatePost = async (postId, detail) => {
  try {
    const { idToken: token } = ls(STORAGE_KEY)

    await api.patch(`${BASE}/posts/${postId}.json?auth=${token}`, detail)
    return { ...detail, id: postId }
  } catch (e) {
    return { error: e.message }
  }
}

export const replyPost = async (forumId, topicId, detail) => {
  try {
    const { idToken: token, email: poster } = ls(STORAGE_KEY)

    const now = new Date()

    const post = {
      forumId,
      topicId,
      title: detail.title,
      content: detail.message,
      creator: poster,
      createdDate: now,
      answered: false
    }

    const addPost = await api.post(`${BASE}/posts.json?auth=${token}`, post)
    const postId = addPost.name

    const fetchTopic = await api.get(`${BASE}/topics/${topicId}.json`)
    const { replies, postsId } = fetchTopic

    let index = 0
    if (postsId) index = postsId.length

    await api.patch(`${BASE}/topics/${topicId}/postsId.json?auth=${token}`, {
      [index]: postId
    })

    await api.patch(`${BASE}/topics/${topicId}.json?auth=${token}`, {
      replies: replies + 1
    })

    const fetchForum = await api.get(`${BASE}/forums/${forumId}.json`)
    const posts = fetchForum.posts

    const forum = {
      id: null,
      lastPost: detail.title,
      lastPostedDate: now,
      lastPoster: poster,
      lastTopicId: topicId,
      posts: posts + 1
    }

    await api.patch(`${BASE}/forums/${forumId}.json?auth=${token}`, forum)
    return { ...post, id: postId }
  } catch (e) {
    return { error: e.message }
  }
}

export const deletePost = async (forumId, topicId, postId) => {
  try {
    const { idToken: token } = ls(STORAGE_KEY)

    const fetchTopic = await api.get(`${BASE}/topics/${topicId}.json`)
    const { replies, postsId } = fetchTopic

    const newPostIds = postsId.filter(t => t !== postId)

    await api.patch(`${BASE}/topics/${topicId}.json?auth=${token}`, {
      replies: replies - 1,
      postsId: newPostIds
    })

    await api.del(`${BASE}/posts/${postId}.json?auth=${token}`)

    const fetchForum = await api.get(`${BASE}/forums/${forumId}.json`)
    const posts = fetchForum.posts

    await api.patch(`${BASE}/forums/${forumId}.json?auth=${token}`, {
      posts: posts - 1
    })
  } catch (e) {
    return { error: e.message }
  }
}

export const isAnswer = async (postId, answered) => {
  try {
    const { idToken: token } = ls(STORAGE_KEY)
    answered = !answered

    await api.patch(`${BASE}/posts/${postId}.json?auth=${token}`, {
      answered
    })
  } catch (e) {
    return { error: e.message }
  }
}
