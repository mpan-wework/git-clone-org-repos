const repo = 'git-clone-org-repos';
const orgRepos = (org, page) => `https://api.github.com/orgs/${org}/repos?sort=full_name&page=${page}`;

Promise.resolve().then(async () => {
  const App = {
    template: `
<div class="App">
  <div class="input">
    <input
    class="token"
    @change="this.tokenChanged"
    placeholder="token"
    :value="this.token"
    />
    <input
      class="org"
      @change="this.orgChanged"
      placeholder="organization"
      :value="this.org"
    />
    <button @click="this.fetch">Fetch</button>
    <button @click="this.copy">Copy to clipboard</button>
    </div>
  <div class="result">
    <div v-for="(row, i) of this.result" :key="i">{{ row.clone_url }}</div>
  </div>
</div>
    `.trim(),
    data() {
      return {
        token: '',
        org: '',
        result: [],
      };
    },
    computed: {
      resultText() {
        return this.result.map((row) => (row.clone_url)).join('\n');
      }
    },
    methods: {
      tokenChanged(e) {
        const token = e.target.value;
        localStorage.setItem(`${repo}:token`, token);
        this.token = token;
      },
      orgChanged(e) {
        const org = e.target.value;
        localStorage.setItem(`${repo}:org`, org);
        this.org = org;
      },
      async fetch() {
        this.result = [];
        for (let i = 1; true; i += 1) {
          const resp = await window.fetch(orgRepos(this.org, i), {
            headers: { Authorization: `token ${this.token}` },
          });
          const pageResults = await resp.json();
          if (pageResults.length === 0) { break; }

          this.result = this.result.concat(pageResults.map(
            (pageResult) => ({ ...pageResult, owner: null }),
          ));
          localStorage.setItem(`${repo}:result`, JSON.stringify(this.result));
        }
      },
      async copy() {
        await navigator.clipboard.writeText(this.resultText);
      },
    },
    mounted() {
      this.token = localStorage.getItem(`${repo}:token`) || '';
      this.org = localStorage.getItem(`${repo}:org`) || '';
      const result = localStorage.getItem(`${repo}:result`) || '[]';
      this.result = JSON.parse(result);
    }
  }

  new Vue({ render: (h) => h(App) })
  .$mount('#vue')
});