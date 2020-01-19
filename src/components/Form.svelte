<script>
  import { createEventDispatcher } from "svelte";
  import Modal from "sveltestrap/src/Modal.svelte";
  import ModalBody from "sveltestrap/src/ModalBody.svelte";
  import ModalFooter from "sveltestrap/src/ModalFooter.svelte";
  import ModalHeader from "sveltestrap/src/ModalHeader.svelte";
  import Form from "sveltestrap/src/Form.svelte";
  import FormGroup from "sveltestrap/src/FormGroup.svelte";
  import FormText from "sveltestrap/src/FormText.svelte";
  import Input from "sveltestrap/src/Input.svelte";
  import Button from "sveltestrap/src/Button.svelte";
  import Label from "sveltestrap/src/Label.svelte";
  import { isEmpty, isValidEmail } from "../helpers/validation.js";

  const dispatch = createEventDispatcher();

  export let isOpen = false;

  export let title = "";
  export let message = "";

  let titleTouched = false;
  let messageTouched = false;

  $: titleValid = !isEmpty(title);
  $: messageValid = !isEmpty(message);
  $: formIsValid = titleValid && messageValid;

  const setDefaults = () => {
    isOpen = false;
    title = "";
    message = "";
    titleTouched = false;
    messageTouched = false;
  };

  const close = () => {
    dispatch("formSubmit", null);
    setDefaults();
  };

  const submit = () => {
    dispatch("formSubmit", { title, message });
    setDefaults();
  };
</script>

<Modal {isOpen}>
  <ModalHeader class="modal-header">
    <slot name="header" />
  </ModalHeader>
  <ModalBody>
    <Form>
      <FormGroup>
        <Label for="title">
          <slot name="title">Title</slot>
        </Label>
        <Input
          type="text"
          id="title"
          bind:value={title}
          on:blur={() => (titleTouched = true)}
          class={!titleValid && titleTouched ? 'invalid' : ''} />
        {#if !titleValid && titleTouched}
          <div class="error-message">This field is required</div>
        {/if}
      </FormGroup>
      <FormGroup>
        <Label for="message">
          <slot name="message">Message</slot>
        </Label>
        <Input
          rows="5"
          type="textarea"
          id="message"
          bind:value={message}
          on:blur={() => (messageTouched = true)}
          class={!messageValid && messageTouched ? 'invalid' : ''} />
        {#if !messageValid && messageTouched}
          <div class="error-message">This field is required</div>
        {/if}
      </FormGroup>
    </Form>
  </ModalBody>
  <ModalFooter>
    <Button color="secondary" on:click={close}>Close</Button>
    <Button color="primary" disabled={!formIsValid} on:click={submit}>
      <slot />
    </Button>
  </ModalFooter>
</Modal>
