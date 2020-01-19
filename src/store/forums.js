import { writable } from 'svelte/store'

const { subscribe, update, set } = writable([])

const forumsStore = {
  subscribe,
  setForums: forums => set(forums),
  addForum: forum => update(forums => forums.concat(forum))
}

export default forumsStore
