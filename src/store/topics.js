import { writable } from 'svelte/store'

const { subscribe, update, set } = writable([])

const topicsStore = {
  subscribe,
  setTopics: topics => set(topics),
  addTopic: topic => update(topics => [topic, ...topics])
}

export default topicsStore
