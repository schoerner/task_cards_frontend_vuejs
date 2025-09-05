<template>
  <div class="card shadow-sm">
    <div class="card-body">
      <div class="row">
        <div class="col">
          <h3>Log in</h3>
        </div>
      </div>
      <div v-if="errorMessage" class="alert alert-danger d-flex align-tasks-center" role="alert">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
             class="bi bi-exclamation-triangle" viewBox="0 0 16 16">
          <path
              d="M7.938 2.016A.13.13 0 0 1 8.002 2a.13.13 0 0 1 .063.016.15.15 0 0 1 .054.057l6.857 11.667c.036.06.035.124.002.183a.2.2 0 0 1-.054.06.1.1 0 0 1-.066.017H1.146a.1.1 0 0 1-.066-.017.2.2 0 0 1-.054-.06.18.18 0 0 1 .002-.183L7.884 2.073a.15.15 0 0 1 .054-.057m1.044-.45a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767z"/>
          <path
              d="M7.002 12a1 1 0 1 1 2 0 1 1 0 0 1-2 0M7.1 5.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0z"/>
        </svg>
        <div>
          <h4>{{ errorMessage.title }}</h4>
          <strong>{{ errorMessage.detail }}</strong>
          <p>{{ errorMessage.description }}</p>
        </div>
      </div>
      <div class="row">
        <Form @submit="handleLogin" :validation-schema="schema">
          <div class="form-group">
            <label for="email">E-Mail</label>
            <Field name="email" type="text" class="form-control"/>
            <ErrorMessage name="email" class="error-feedback"/>
          </div>
          <div class="form-group">
            <label for="password">Password</label>
            <Field name="password" type="password" class="form-control"/>
            <ErrorMessage name="password" class="error-feedback"/>
          </div>

          <div class="form-group">
            <button class="btn btn-primary btn-block" :disabled="loading">
                    <span
                        v-show="loading"
                        class="spinner-border spinner-border-sm"
                    ></span>
              <span>Login</span>
            </button>
          </div>
        </Form>
      </div>
    </div>
  </div>
</template>

<script>
// todo https://www.bezkoder.com/vue-3-authentication-jwt/#google_vignette

import {Form, Field, ErrorMessage} from "vee-validate";
import * as yup from "yup";

export default {
  name: "UserLogin",
  components: {
    Form,
    Field,
    ErrorMessage,
  },
  data() {
    const schema = yup.object().shape({
      email: yup.string().required("E-Mail is required!"),
      password: yup.string().required("Password is required!"),
    });

    return {
      loading: false,
      errorMessage: "",
      schema,
    };
  },
  computed: {
    loggedIn() {
      return this.$store.state.auth.status.loggedIn;
    },
  },
  created() {
    if (this.loggedIn) {
      this.$router.push("/profile");
    }
  },
  methods: {
    handleLogin(user) {
      this.loading = true;

      this.$store.dispatch("auth/login", user)
          .then(
              () => {
                this.$router.push("/profile");
              },
              (error) => {
                this.loading = false;
                this.errorMessage = error.response.data;
                console.log( error );
                /*
                    (error.response &&
                        error.response.data &&
                        error.response.data.message) ||
                    error.message ||
                    error.toString();
                 */
              }
          );
    },
  },
};
</script>

<style></style>