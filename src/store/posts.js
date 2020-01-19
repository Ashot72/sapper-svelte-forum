import { writable } from 'svelte/store'

const { subscribe, update, set } = writable([])

const postsStore = {
  subscribe,
  setPosts: posts => set(posts),
  addPost: post => update(posts => [...posts, post]),
  updatePost: post =>
    update(posts => posts.map(p => (p.id === post.id ? { ...p, ...post } : p))),
  markAnswered: id =>
    update(posts =>
      posts.map(p => (p.id === id ? { ...p, answered: !p.answered } : p))
    ),
  removePost: id => update(posts => posts.filter(i => i.id !== id))
}

export default postsStore
