<script>
  import { goto } from "@sapper/app";
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
  import ls from "local-storage";
  import { isEmpty, isValidEmail } from "../helpers/validation.js";
  import { STORAGE_KEY } from "../helpers/constants.js";
  import * as api from "../api.js";
  import {
    API_URL,
    SIGNIN_URL,
    SIGNUP_URL,
    KEY
  } from "../helpers/constants.js";
  import { auth } from "../store/auth.js";

  export let isOpen = false;
  export let action = null;

  let email = "";
  let password = "";
  let confirmPassword = "";
  let error = null;

  let emailTouched = false;
  let passwordTouched = false;
  let confirmPasswordTouched = false;

  $: emailValid = isValidEmail(email);
  $: passwordValid = !isEmpty(password);
  $: confirmPasswordValid = !isEmpty(confirmPassword);
  $: passwordsEqual =
    password && confirmPassword && password === confirmPassword;

  $: formIsValid =
    action === "signUp"
      ? emailValid && passwordValid && confirmPasswordValid && passwordsEqual
      : emailValid && passwordValid;

  const close = () => {
    error = null;
    isOpen = false;
    action = null;
    email = "";
    password = "";
    confirmPassword = "";
    emailTouched = false;
    passwordTouched = false;
    confirmPasswordTouched = false;
  };

  const submit = async () => {
    error = null;

    const res = await api.post(
      action === "signUp"
        ? `${API_URL}/${SIGNUP_URL}?key=${KEY}`
        : `${API_URL}/${SIGNIN_URL}?key=${KEY}`,
      {
        email,
        password,
        returnSecureToken: true
      }
    );

    if (res && "error" in res) {
      error = `${res.error.code} - ${res.error.message}`;
    } else {
      const data = {
        idToken: res.idToken,
        refreshToken: res.refreshToken,
        email: res.email,
        expiresIn: res.expiresIn,
        date: new Date()
      };
      ls(STORAGE_KEY, data);
      auth.set(data);

      close();
      goto("/");
    }
  };
</script>

<Modal {isOpen}>
  <ModalHeader class="modal-header">
    <slot />
  </ModalHeader>
  <ModalBody>
    <Form>
      <FormGroup>
        <Label for="email">Email</Label>
        <Input
          type="email"
          id="email"
          bind:value={email}
          on:blur={() => (emailTouched = true)}
          class={!emailValid && emailTouched ? 'invalid' : ''} />
        {#if !emailValid && emailTouched}
          <div class="error-message">Please enter a valid email</div>
        {/if}
      </FormGroup>

      <FormGroup>
        <Label for="password">Password</Label>
        <Input
          type="password"
          id="password"
          bind:value={password}
          on:blur={() => (passwordTouched = true)}
          class={!passwordValid && passwordTouched ? 'invalid' : ''} />
        {#if !passwordValid && passwordTouched}
          <div class="error-message">Please enter a valid password</div>
        {/if}
      </FormGroup>

      {#if action === 'signUp'}
        <FormGroup>
          <Label for="confirmpassword">Confirm Password</Label>
          <Input
            type="password"
            id="confirmPassword"
            bind:value={confirmPassword}
            on:blur={() => (confirmPasswordTouched = true)}
            class={!confirmPasswordValid && confirmPasswordTouched ? 'invalid' : ''} />
          {#if !confirmPasswordValid && confirmPasswordTouched}
            <div class="error-message">
              Please enter a valid confirm password
            </div>
          {/if}
          {#if passwordsEqual === false}
            <div class="error-message">
              Password and confirmation password do not match
            </div>
          {/if}
        </FormGroup>
      {/if}

      {#if error}
        <div class="error-message">{error}</div>
      {/if}
    </Form>
  </ModalBody>
  <ModalFooter>
    <Button color="secondary" on:click={close}>Close</Button>
    <Button color="primary" disabled={!formIsValid} on:click={submit}>
      <slot />
    </Button>
  </ModalFooter>
</Modal>
