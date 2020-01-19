<script context="module">
  export async function preload({ params: { forumId } }) {
    const res = await fetchTopics(forumId, this);
    if (res && "error" in res) {
      this.error(500, res.error);
    } else {
      const topics = [];
      for (const key in res) {
        topics.push({
          ...res[key],
          id: key
        });
      }

      return { forumId, topics: topics.reverse() };
    }
  }
</script>

<script>
  import { goto } from "@sapper/app";
  import { onMount, onDestroy } from "svelte";
  import { fly } from "svelte/transition";
  import { flip } from "svelte/animate";
  import Col from "sveltestrap/src/Col.svelte";
  import Row from "sveltestrap/src/Row.svelte";
  import { BASE } from "../../helpers/constants.js";
  import { formatDate } from "../../helpers/filters.js";
  import { forumsStore, topicsStore, authStore } from "../../store";
  import { Breadcrumb, Loader, Form, Confirm } from "../../components/";
  import {
    addTopic,
    fetchForum,
    updateForum,
    deleteForum,
    fetchTopics
  } from "../../store/actions.js";
  import * as api from "../../api";

  export let forumId;
  export let topics;

  const actions = {
    addTopic: "AddTopic",
    updateForum: "Update Forum",
    deleteForum: "Delete {} Forum"
  };

  let forum;

  let title = "";
  let message = "";

  let forumName;

  let isOpen = false;
  let isConfirmOpen = false;

  let error = null;
  let loading = true;
  let action = null;
  let unsubscribe;

  $: forumName = forum ? forum.name : "";
  $: canModify = forum && forum.creator === $authStore.email;

  const showEditForum = async () => {
    isOpen = true;
    title = forum.name;
    message = forum.description;
    action = actions.updateForum;
  };

  const shouldDeleteForum = () => {
    isConfirmOpen = true;
    action = actions.deleteForum;
  };

  const update_forum = async detail => {
    error = null;
    loading = true;

    const res = await updateForum({ ...detail, forumId });
    res && "error" in res ? (error = res.error) : goto("/");
    loading = false;
  };

  const delete_forum = async () => {
    error = null;
    loading = true;

    const res = await deleteForum(forumId);
    res && "error" in res
      ? ((error = res.error), (loading = false))
      : goto("/");
  };

  const add_topic = async detail => {
    error = null;
    loading = true;

    const res = await addTopic(forumId, detail);
    res && "error" in res ? (error = res.error) : topicsStore.addTopic(res);
    loading = false;
  };

  const loadForum = async () => {
    if ($forumsStore.length === 0) {
      const res = await fetchForum(forumId);
      res && "error" in res ? (error = res.error) : (forum = res);
    } else {
      forum = $forumsStore.find(i => i.id === forumId);
    }
  };

  onMount(async () => {
    topicsStore.setTopics(topics);
    unsubscribe = topicsStore.subscribe(items => (topics = items));
    loading = false;

    loadForum();
  });

  onDestroy(() => {
    if (unsubscribe) {
      unsubscribe();
    }
  });
</script>

<svelte:head>
  <title>Topics</title>
</svelte:head>

{#if loading}
  <Loader />
{/if}

<Breadcrumb items={[{ link: '/', title: 'Home' }, { title: forumName }]} />

{#if $authStore.email}
  <div>
    <a
      href="."
      on:click|preventDefault={() => ((isOpen = true), (action = actions.addTopic))}>
      Add Topic
    </a>
    {#if canModify}
      &nbsp;
      <a href="." on:click|preventDefault={showEditForum}>Update Forum</a>
      &nbsp;
      <a href="." on:click|preventDefault={shouldDeleteForum}>Delete Forum</a>
    {/if}
  </div>
{/if}

{#if error}
  <div class="error-message center">{error}</div>
{/if}

<Row class="header">
  <Col xs="6">Topics</Col>
  <Col class="d-none d-sm-block" sm="2">Replies/Views</Col>
  <Col xs="4">Lastest Post</Col>
</Row>

{#each topics as topic (topic.id)}
  <div
    class="item"
    in:fly={{ duration: 500, x: 700 }}
    animate:flip={{ duration: 900 }}>
    <Row>
      <Col xs="6">
        <a rel="prefetch" href="/posts/{forumId}/{topic.id}">{topic.title}</a>
        <br />
        by {topic.creator}
        <br />
        {formatDate(topic.createdDate)}
        <Col class="d-sm-none">
          Replies:
          <a href="/posts/{forumId}/{topic.id}">{topic.replies}</a>
          <br />
          Views:
          <a href="/posts/{forumId}/{topic.id}">{topic.views}</a>
        </Col>
      </Col>
      <Col class="d-none d-sm-block" sm="2">
        Replies:
        <a href="/posts/{forumId}/{topic.id}">{topic.replies}</a>
        <br />
        Views:
        <a href="/posts/{forumId}/{topic.id}">{topic.views}</a>
      </Col>
      <Col xs="4">
        by {topic.lastPoster}
        <br />
        {formatDate(topic.lastPostedDate)}
      </Col>
    </Row>
  </div>
{/each}

<Form
  bind:isOpen
  bind:title
  bind:message
  on:formSubmit={({ detail }) => {
    if (detail) {
      action === actions.addTopic ? add_topic(detail) : update_forum(detail);
    }
  }}>
  <span slot="header">{action === 'add' ? 'Add New Topic' : 'Edit Forum'}</span>
  <span slot="title">Subject</span>
  {action === 'add' ? 'Add' : 'Update'}
</Form>

<Confirm
  bind:isConfirmOpen
  on:delete={({ detail }) => {
    if (detail) {
      delete_forum();
    }
  }}>
  {action.replace('{}', forumName)}
</Confirm>
