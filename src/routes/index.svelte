<script context="module">
  export async function preload(page) {
    const res = await fetchForums(this);

    if (res && "error" in res) {
      this.error(500, res.error);
    } else {
      const forums = [];
      for (const key in res) {
        forums.push({
          ...res[key],
          id: key
        });
      }
      return { forums };
    }
  }
</script>

<script>
  import { onMount, onDestroy } from "svelte";
  import { fly } from "svelte/transition";
  import Col from "sveltestrap/src/Col.svelte";
  import Row from "sveltestrap/src/Row.svelte";
  import { BASE } from "../helpers/constants.js";
  import { formatDate } from "../helpers/filters.js";
  import { forumsStore, authStore } from "../store/";
  import { Breadcrumb, Loader, Form } from "../components";
  import { fetchForums, addForum } from "../store/actions.js";
  import * as api from "../api";

  export let forums;

  let isOpen = false;
  let error = null;
  let loading = true;
  let unsubscribe;

  const add_forum = async detail => {
    error = null;
    loading = true;

    const res = await addForum(detail);
    res && "error" in res ? (error = res.error) : forumsStore.addForum(res);
    loading = false;
  };

  onMount(() => {
    forumsStore.setForums(forums);
    unsubscribe = forumsStore.subscribe(items => (forums = items));
    loading = false;
  });

  onDestroy(() => {
    if (unsubscribe) {
      unsubscribe();
    }
  });
</script>

<svelte:head>
  <title>Forums</title>
</svelte:head>

{#if loading}
  <Loader />
{/if}

<Breadcrumb items={[{ title: 'Home' }]} />

{#if $authStore.email}
  <div>
    <a href="." on:click|preventDefault={() => (isOpen = true)}>Add Forum</a>
  </div>
{/if}

{#if error}
  <div class="error-message center">{error}</div>
{/if}

<Row class="header">
  <Col xs="6">Name</Col>
  <Col class="d-none d-sm-block" sm="2">Topics/Posts</Col>
  <Col xs="4">Last Post</Col>
</Row>

{#each forums as forum (forum.id)}
  <div class="item" in:fly={{ duration: 500, x: 700 }}>
    <Row>
      <Col xs="6">
        <a rel="prefetch" href="/topics/{forum.id}">{forum.name}</a>
        <br />
        {forum.description}
        <Col class="d-sm-none">
          Topics:
          <a href="/topics/{forum.id}">{forum.topics}</a>
          <br />
          Posts:
          <a href="/topics/{forum.id}">{forum.posts}</a>
        </Col>
      </Col>
      <Col class="d-none d-sm-block" sm="2">
        Topics:
        <a href="/topics/{forum.id}">{forum.topics}</a>
        <br />
        Posts:
        <a href="/topics/{forum.id}">{forum.posts}</a>
      </Col>
      <Col xs="4">
        {#if forum.lastPoster}
          <a href="/posts/{forum.id}/{forum.lastTopicId}#last">
            {forum.lastPost}
          </a>
          <br />
          by {forum.lastPoster}
          <br />
          {formatDate(forum.lastPostedDate)}
        {/if}
      </Col>
    </Row>
  </div>
{/each}

<Form
  bind:isOpen
  on:formSubmit={({ detail }) => {
    if (detail) {
      add_forum(detail);
    }
  }}>
  <span slot="header">Add Forum</span>
  <span slot="title">Name</span>
  <span slot="message">Description</span>
  Add Forum
</Form>
