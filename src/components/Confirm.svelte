<script>
  import { createEventDispatcher } from "svelte";
  import Modal from "sveltestrap/src/Modal.svelte";
  import ModalBody from "sveltestrap/src/ModalBody.svelte";
  import ModalFooter from "sveltestrap/src/ModalFooter.svelte";
  import ModalHeader from "sveltestrap/src/ModalHeader.svelte";
  import Button from "sveltestrap/src/Button.svelte";

  export let isConfirmOpen = false;
  const dispatch = createEventDispatcher();

  const action = del => {
    dispatch("delete", del);
    isConfirmOpen = false;
  };
</script>

<Modal isOpen={isConfirmOpen}>
  <ModalHeader>Confirm</ModalHeader>
  <ModalBody>
    Are you sure you want to delete '
    <slot />
    '?
  </ModalBody>
  <ModalFooter>
    <Button color="secondary" on:click={() => action(false)}>No</Button>
    <Button color="primary" on:click={() => action(true)}>Yes</Button>
  </ModalFooter>
</Modal>
