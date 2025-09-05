<template>
    <div class="card shadow-sm">
        <div class="card-body">
            <div class="row">
                <div class="col">
                    <h3>Sign up</h3>
                </div>
            </div>
            <div v-if="errorMessage" class="alert alert-danger d-flex align-tasks-center" role="alert">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-exclamation-triangle" viewBox="0 0 16 16">
                    <path d="M7.938 2.016A.13.13 0 0 1 8.002 2a.13.13 0 0 1 .063.016.15.15 0 0 1 .054.057l6.857 11.667c.036.06.035.124.002.183a.2.2 0 0 1-.054.06.1.1 0 0 1-.066.017H1.146a.1.1 0 0 1-.066-.017.2.2 0 0 1-.054-.06.18.18 0 0 1 .002-.183L7.884 2.073a.15.15 0 0 1 .054-.057m1.044-.45a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767z"/>
                    <path d="M7.002 12a1 1 0 1 1 2 0 1 1 0 0 1-2 0M7.1 5.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0z"/>
                </svg>
                <div>
                  <p>{{ errorMessage }}</p>
                </div>
            </div>
            <div v-if="successMessage" class="alert alert-success d-flex align-tasks-center" role="alert">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                   class="bi bi-exclamation-triangle" viewBox="0 0 16 16">
                <path
                    d="M7.938 2.016A.13.13 0 0 1 8.002 2a.13.13 0 0 1 .063.016.15.15 0 0 1 .054.057l6.857 11.667c.036.06.035.124.002.183a.2.2 0 0 1-.054.06.1.1 0 0 1-.066.017H1.146a.1.1 0 0 1-.066-.017.2.2 0 0 1-.054-.06.18.18 0 0 1 .002-.183L7.884 2.073a.15.15 0 0 1 .054-.057m1.044-.45a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767z"/>
                <path
                    d="M7.002 12a1 1 0 1 1 2 0 1 1 0 0 1-2 0M7.1 5.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0z"/>
              </svg>
              <div>
                <p>{{ successMessage }}</p>
              </div>
            </div>
            <div class="row">
              <Form @submit="handleRegister" :validation-schema="schema">
                <div v-if="!successful">
                  <div class="form-group">
                    <label for="email">Email</label>
                    <Field name="email" type="email" class="form-control" />
                    <ErrorMessage name="email" class="error-feedback" />
                  </div>
                  <div class="form-group">
                    <label for="password">Password</label>
                    <Field name="password" type="password" class="form-control" />
                    <ErrorMessage name="password" class="error-feedback" />
                  </div>
                  <div class="form-group">
                    <label for="firstName">First name</label>
                    <Field name="firstName" type="text" class="form-control" />
                    <ErrorMessage name="firstName" class="error-feedback" />
                  </div>
                  <div class="form-group">
                    <label for="lastName">First name</label>
                    <Field name="lastName" type="text" class="form-control" />
                    <ErrorMessage name="lastName" class="error-feedback" />
                  </div>

                  <div class="form-group">
                    <button class="btn btn-primary btn-block" :disabled="loading">
              <span
                  v-show="loading"
                  class="spinner-border spinner-border-sm"
              ></span>
                      Sign Up
                    </button>
                  </div>
                </div>
              </Form>
            </div>
        </div>
    </div>
</template>

<script>
import { Form, Field, ErrorMessage } from "vee-validate";
import * as yup from "yup";

export default {
  name: "UserSignUp",
  components: {
    Form,
    Field,
    ErrorMessage,
  },
  data() {
    const schema = yup.object().shape({
      email: yup
          .string()
          .required("Email is required!")
          .email("Email is invalid!")
          .max(50, "Must be maximum 50 characters!"),
      password: yup
          .string()
          .required("Password is required!")
          .min(6, "Must be at least 6 characters!")
          .max(40, "Must be maximum 40 characters!"),
      firstName: yup
          .string()
          .required("First name is required!")
          .min(2, "Must be at least 3 characters!")
          .max(50, "Must be maximum 50 characters!"),
      lastName: yup
          .string()
          .required("Last name is required!")
          .min(2, "Must be at least 3 characters!")
          .max(50, "Must be maximum 50 characters!"),
    });


    return {
      successful: false,
      loading: false,
      errorMessage: "",
      successMessage: "",
      schema,
    };
  },
  computed: {
    loggedIn() {
      return this.$store.state.auth.status.loggedIn;
    },
  },
  mounted() {
    if (this.loggedIn) {
      this.$router.push("/profile");
    }
  },
  methods: {
    handleRegister(user) {
      console.log("UserSignUp.handleRegister: user: ", user);
      this.message = "";
      this.successful = false;
      this.loading = true;

      this.$store.dispatch("auth/register", user).then(
          (data) => {
            console.log("store.dispatch-data: ", data);
            this.successMessage = "You have been successfully registered!";
            this.successful = true;
            this.loading = false;
          },
          (error) => {
            console.log("store.dispatch-error: ", error);
            this.errorMessage = "There was an error creating your account!";
            if(error.response && error.response.status==409) {
              this.errorMessage += " Are you already registered?";
            }
            if(error.response && error.response.status==502) {
              this.errorMessage += " There is an application error. Ask your admin: Is the backend running? ;-)";
            }
            /*
            this.message +=
                (error.response &&
                    error.response.data &&
                    error.response.data.message) ||
                error.message ||
                error.toString();

             */
            this.successful = false;
            this.loading = false;
          }
      );
    },
  },
};
</script>

<style></style>