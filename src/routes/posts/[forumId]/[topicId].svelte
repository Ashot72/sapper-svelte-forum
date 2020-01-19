<script context="module">
  export async function preload({ params: { forumId, topicId } }) {
    const res = await fetchPosts(topicId, this);

    if (res && "error" in res) {
      this.error(500, res.error);
    } else {
      const posts = [];
      for (const key in res) {
        posts.push({
          ...res[key],
          id: key
        });
      }
      return { forumId, topicId, posts };
    }
  }
</script>

<script>
  import { goto } from "@sapper/app";
  import { onMount, onDestroy } from "svelte";
  import { fly } from "svelte/transition";
  import Col from "sveltestrap/src/Col.svelte";
  import Row from "sveltestrap/src/Row.svelte";
  import { BASE } from "../../../helpers/constants.js";
  import { lnToBr } from "../../../helpers/common.js";
  import { formatDate } from "../../../helpers/filters.js";
  import {
    forumsStore,
    topicsStore,
    postsStore,
    authStore
  } from "../../../store";
  import { Breadcrumb, Loader, Form, Confirm } from "../../../components";
  import {
    fetchForum,
    fetchTopic,
    updateTopic,
    deleteTopic,
    replyPost,
    updatePost,
    deletePost,
    fetchPosts,
    updateTopicView,
    isAnswer
  } from "../../../store/actions.js";
  import * as api from "../../../api";

  export let forumId;
  export let topicId;
  export let posts;

  const actions = {
    updateTopic: "Update Topic",
    updatePost: "Update Post",
    replyPost: "Reply Post",
    deleteTopic: "Delete {} Topic",
    deletePost: "Delete {} Post"
  };

  let forum;
  let topic;

  let title;
  let message;

  let forumName;
  let topicTitle;

  let isOpen = false;
  let isConfirmOpen = false;

  let error = null;
  let loading = true;
  let action = null;
  let postId;
  let unsubscribe;

  $: forumName = forum ? forum.name : "";
  $: topicTitle = topic ? topic.title : "";
  $: canModify = topic && topic.creator === $authStore.email;

  const showEditTopic = async () => {
    isOpen = true;
    title = topic.title;
    message = topic.content;
    action = actions.updateTopic;
  };

  const showEditPost = async post => {
    postId = post.id;
    isOpen = true;
    title = post.title;
    message = post.content;
    action = actions.updatePost;
  };

  const showReplyPost = async post => {
    isOpen = true;
    title = post.title;
    action = actions.replyPost;
  };

  const shouldDeleteTopic = () => {
    isConfirmOpen = true;
    action = actions.deleteTopic;
  };

  const shouldDeletePost = post => {
    postId = post.id;
    isConfirmOpen = true;
    action = actions.deletePost;
  };

  const update_topic = async detail => {
    error = null;
    loading = true;

    const res = await updateTopic({ ...detail, topicId });
    res && "error" in res
      ? ((error = res.error), (loading = false))
      : goto(`/topics/${forumId}`);
  };

  const delete_topic = async () => {
    error = null;
    loading = true;

    const res = await deleteTopic(forumId, topicId);
    res && "error" in res
      ? ((error = res.error), (loading = false))
      : goto(`/topics/${forumId}`);
  };

  const update_post = async detail => {
    error = null;
    loading = true;

    const res = await updatePost(postId, {
      title: detail.title,
      content: detail.message
    });
    res && "error" in res ? (error = res.error) : postsStore.updatePost(res);
    loading = false;
  };

  const reply_post = async detail => {
    error = null;
    loading = true;

    const res = await replyPost(forumId, topicId, detail);
    res && "error" in res ? (error = res.error) : postsStore.addPost(res);
    loading = false;
  };

  const delete_post = async () => {
    error = null;
    loading = true;

    const res = await deletePost(forumId, topicId, postId);
    res && "error" in res ? (error = res.error) : postsStore.removePost(postId);
    loading = false;
  };

  const mark_as_answered = async ({ id, answered }) => {
    error = null;
    loading = true;

    const res = await isAnswer(id, answered);
    res && "error" in res ? (error = res.error) : postsStore.markAnswered(id);
    loading = false;
  };

  const update_topic_view = () => updateTopicView(topicId);

  const execute = detail => {
    switch (action) {
      case actions.updateTopic:
        update_topic(detail);
        break;
      case actions.updatePost:
        update_post(detail);
        break;
      case actions.replyPost:
        reply_post(detail);
        break;
      default:
        error = `Unknown action '${action}'`;
        break;
    }
  };

  const loadForum = () => {
    const getForum = async () => {
      const res = await fetchForum(forumId);
      res && "error" in res ? (error = res.error) : (forum = res);
    };

    if ($forumsStore.length === 0) {
      getForum();
    } else {
      forum = $forumsStore.find(i => i.id === forumId);
      //forums 'Last Post' click case
      if (!forum) {
        getForum();
      }
    }
  };

  const loadTopic = () => {
    const getTopic = async () => {
      const res = await fetchTopic(topicId);
      "error" in res ? (error = res.error) : (topic = res);
    };

    if ($topicsStore.length === 0) {
      getTopic();
    } else {
      topic = $topicsStore.find(i => i.id === topicId);
      //forums 'Last Post' click case
      if (!topic) {
        getTopic();
      }
    }
  };

  const scrollToEnd = () => {
    if (window.location.hash) {
      setTimeout(() => window.scrollTo(0, document.body.scrollHeight), 500);
    }
  };

  onMount(async () => {
    postsStore.setPosts(posts);
    unsubscribe = postsStore.subscribe(items => (posts = items));
    loading = false;

    loadForum();
    loadTopic();
    scrollToEnd();

    if ($authStore.email) {
      update_topic_view();
    }
  });

  onDestroy(() => {
    if (unsubscribe) {
      unsubscribe();
    }
  });
</script>

<style>
  .center {
    text-align: center;
  }

  .img-thumbnail {
    padding: 0.25rem;
    background-color: #fff;
    border: 1px solid #dee2e6;
    border-radius: 0.25rem;
  }

  .reply {
    margin-right: 17px;
    position: absolute;
    bottom: 0;
    right: 0;
  }

  .answered {
    border: 2px solid #d3d3d3;
    padding: 5px;
  }
</style>

<svelte:head>
  <title>Posts</title>
</svelte:head>

{#if loading}
  <Loader />
{/if}

<Breadcrumb
  items={[{ link: '/', title: 'Home' }, { link: `/topics/${forumId}`, title: forumName }, { title: topicTitle }]} />

{#if $authStore.email && canModify}
  <div>
    <a href="." on:click|preventDefault={showEditTopic}>Update Topic</a>
    &nbsp;
    <a href="." on:click|preventDefault={shouldDeleteTopic}>Delete Topic</a>
  </div>
{/if}

{#if error}
  <div class="error-message center">{error}</div>
{/if}

<Row class="header">
  <Col xs="12">{title}</Col>
</Row>

{#each posts as post, i (post.id)}
  <div class="item" in:fly={{ duration: 500, x: 700 }}>
    <Row>
      <Col sm="2">
        <div class="center">
          <img src="user.jpg" alt="profile picture" class="img-thumbnail" />
          <div style="word-wrap: break-word">
            {post.creator}
            <br />
            {formatDate(post.createdDate)}
          </div>
        </div>
      </Col>
      <Col sm="10">
        <div class:answered={post.answered}>
          <b>{post.title}</b>
          <br />
          <br />
          {@html lnToBr(post.content)}

          {#if $authStore.email}
            <br />
            <br />
            <div class="reply">
              <div>
                {#if i > 0 && post.creator === $authStore.email && i === posts.length - 1}
                  <a
                    href="."
                    on:click|preventDefault={() => shouldDeletePost(post)}>
                    Delete
                  </a>
                  &nbsp;
                {/if}
                {#if post.creator === $authStore.email}
                  <a
                    href="."
                    on:click|preventDefault={() => showEditPost(post)}>
                    Update
                  </a>
                  &nbsp;
                {/if}
                {#if posts[0].creator === $authStore.email}
                  <a
                    href="."
                    on:click|preventDefault={() => mark_as_answered(post)}>
                    {post.answered ? 'Mark not Answered' : 'Mark Answered'}
                  </a>
                  &nbsp;
                {/if}
                <a href="." on:click|preventDefault={() => showReplyPost(post)}>
                  Reply
                </a>
              </div>
            </div>
          {/if}
        </div>
      </Col>
    </Row>
  </div>
  <hr />
{/each}

<Form
  bind:isOpen
  bind:title
  bind:message
  on:formSubmit={({ detail }) => {
    if (detail) {
      execute(detail);
    }
  }}>
  <span slot="header">{action}</span>
  <span slot="title">Subject</span>
  {action}
</Form>

<Confirm
  bind:isConfirmOpen
  on:delete={({ detail }) => {
    if (detail) {
      action == actions.deleteTopic ? delete_topic() : delete_post();
    }
  }}>
  {action.replace('{}', topicTitle)}
</Confirm>
