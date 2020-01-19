<script>
  import { goto } from "@sapper/app";
  import { onMount } from "svelte";
  import moment from "moment";
  import ls from "local-storage";
  import { STORAGE_KEY, REFRESHTOKEN_URL, KEY } from "../helpers/constants.js";
  import { Nav } from "../components";
  import * as api from "../api.js";
  import { auth } from "../store/auth.js";
  import { signOut } from "../helpers/common.js";

  const getDateDiff = (from, to, dateFormat) => {
    const mFromDate = moment(from, dateFormat);
    const mEndDate = moment(to, dateFormat);
    return mEndDate.diff(mFromDate, "seconds");
  };

  const setAuth = () => {
    const storage = ls(STORAGE_KEY);
    if (storage) auth.set(storage);
  };

  const getDifference = ({ expiresIn, date }) => {
    const authDate = new Date(date);

    return getDateDiff(
      new Date(),
      moment(authDate).add(expiresIn, "seconds"),
      "MM-DD-YYYY"
    );
  };

  const updateToken = () => {
    const storage = ls(STORAGE_KEY);

    if (storage) {
      let difference = getDifference(storage);
      if (difference <= 0) signOut();

      setInterval(async () => {
        try {
          const res = await api.post(`${REFRESHTOKEN_URL}?key=${KEY}`, {
            grant_type: "refresh_token",
            refresh_token: storage.refreshToken
          });

          const { id_token, refresh_token, expires_in } = res;
          const data = {
            idToken: id_token,
            refreshToken: refresh_token,
            email: storage.email,
            expiresIn: expires_in,
            date: new Date()
          };

          ls(STORAGE_KEY, data);
          auth.set(data);
          difference = getDifference(storage);
        } catch (err) {
          signOut();
        }
      }, (difference - 100) * 1000);
    }
  };

  onMount(() => {
    setAuth();
    updateToken();
  });
</script>

<style>
  main {
    position: relative;
    background-color: white;
    padding: 2em;
  }
</style>

<Nav />
<main>
  <slot />
</main>
