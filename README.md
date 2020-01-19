This is a Sapper (Svelte) basic forum web application which I already built with [Vue.js ](https://github.com/Ashot72/Vue2Forum) and [Nuxt.js](https://github.com/Ashot72/Nuxt2Forum).

[Svelte](https://svelte.dev) is a radical new approach to building user interfaces. It shifts the work into a compile step that happens when you build you app as opposed to React and Vue frameworks where the bulk of the work is done in the browser. Svelte is a compiler not a framework. Svelte works on real DOM, no virtual DOM. The idea behind Svelte is that you do not ship your code in a framework but you write a code using a certain syntax and the Svelte is a tool that runs over your code and generates pure vanilla JavaScript code which is highly optimized and which contains a bunch of instructions which will basically make the things happen in the browser. Reducing the amount of the code you have to write is an explicit goal of Svelte. For example, a React component is typically around 40% larger than its Svelte equivalent.

[Sapper](https://sapper.svelte.dev/) is an application framework powered by Svelte. If you are familiar with Next.js for React, the framework built on top of React, or Nuxt.js for Vue, it is the same idea with one major difference – better performance. Sapper takes care of all the heavy lifting including things like Server Rendering, Routing, Code splitting, Progressive web app by default, prefetching of routes, testing etc.

The app is hosted on Firebase (static hosting) https://svelte-forum.web.app/. You may not see the forums, topics, posts you created or even receive ‘Page Not Found’ after refreshing the browser.
You will not face it if you run your app locally. Please watch the video and read the description below.

To get started.

```
       Clone the repository

       git https://github.com/Ashot72/sapper-svelte-forum
       cd sapper-svelte-forum.git

       # installs dependencies
       npm install

       # starts the app in development mode, and watches source files for changes
       npm run dev

       # builds the app in production mode
       npm run build

       # bakes out a static version, If applicable
       npm run export

       # starts the app in production mode after you’ve built it
       npm start

       # runs the tests
       npm test

```

Go to [Sapper Svelte](https://youtu.be/_GnSUpDZSIE) video page

Go to [How to run and description](https://ashot72.github.io/sapper-svelte-forum/) page
