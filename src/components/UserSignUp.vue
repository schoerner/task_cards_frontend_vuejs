<template>
    <div class="card shadow-sm">
        <div class="card-body">
            <div class="row">
                <div class="col">
                    <h3>Sign up</h3>
                </div>
            </div>
            <div class="container" v-if="status">
                <div class="alert alert-success" role="alert">
                    <h4 class="alert-heading">Success!</h4>
                    <p>{{ status }}</p>
                </div>
            </div>
            <div v-if="errorMessage" class="alert alert-danger d-flex align-items-center" role="alert">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-exclamation-triangle" viewBox="0 0 16 16">
                    <path d="M7.938 2.016A.13.13 0 0 1 8.002 2a.13.13 0 0 1 .063.016.15.15 0 0 1 .054.057l6.857 11.667c.036.06.035.124.002.183a.2.2 0 0 1-.054.06.1.1 0 0 1-.066.017H1.146a.1.1 0 0 1-.066-.017.2.2 0 0 1-.054-.06.18.18 0 0 1 .002-.183L7.884 2.073a.15.15 0 0 1 .054-.057m1.044-.45a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767z"/>
                    <path d="M7.002 12a1 1 0 1 1 2 0 1 1 0 0 1-2 0M7.1 5.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0z"/>
                </svg>
                <div>
                    <p>{{ errorMessage }}</p>
                </div>
            </div>
            <div class="row">
                <form v-show="showForm" v-on:submit.prevent="signUp">
                    <div class="row mb-3">
                        <label for="email"  class="col-sm-2 col-form-label">Email: </label>
                        <div class="col-sm-10">
                            <input id="email" v-model="email" playceholder="user@test.org" ref="emailRef" required>
                        </div>
                    </div>
                    <div class="row mb-3">
                        <label for="password"  class="col-sm-2 col-form-label">Password: </label>
                        <div class="col-sm-10">
                            <input id="password" type="password" placeholder="****" rows="4" cols="50" class="form-control" v-model="password" />
                        </div>
                    </div>
                    <div class="row mb-3">
                        <label for="password_verification"  class="col-sm-2 col-form-label">Password verification: </label>
                        <div class="col-sm-10">
                            <input id="password_verification" type="password" placeholder="****" rows="4" cols="50" class="form-control" v-model="password_verification" />
                        </div>
                    </div>
                    <div class="row mb-3">
                        <label for="first_name"  class="col-sm-2 col-form-label">First name: </label>
                        <div class="col-sm-10">
                            <input id="first_name" v-model="first_name" playceholder="John" ref="emailRef" required>
                        </div>
                    </div>
                    <div class="row mb-3">
                        <label for="last_name"  class="col-sm-2 col-form-label">Last name: </label>
                        <div class="col-sm-10">
                            <input id="last_name" v-model="last_name" playceholder="Doe" ref="emailRef" required>
                        </div>
                    </div>
                    <button class="btn btn-primary" type="submit">Sign up</button>
                    <button class="btn btn-secondary" type="reset">Clear</button>
                </form>
            </div>
        </div>
    </div>
</template>

<script>
import axios from 'axios';

export default {
    data() {
        return {
            showForm: true,
            email: "",
            password: "",
            password_verification: "",
            first_name: "",
            last_name: "",
            status: "",
            errorMessage: ""
        }
    },
    methods: {
        signUp() {
            // todo: do some consistency checks here
            const newUser = {
                email: this.email,
                password: this.password,
                passwordVerification: this.password_verification,
                firstName: this.first_name,
                lastName: this.last_name
            }
            // Example from https://medium.com/@pasb/how-to-test-cors-with-postman-local-or-domain-991acbb2c046
            // async //const response = await axios.post("http://localhost:8088/rest/tasks", dataToSave)
            //this.newItemId = response.data.id;
            axios.post("http://localhost:8088/auth/signup", newUser)
                .then(response => {
                    this.newItemId = response.data.id
                    this.status = "The user was saved with id " + response.data.id
                    
                    this.email = ""
                    this.password = ""
                    this.password_verification = ""
                    this.first_name = ""
                    this.last_name = ""

                    this.showForm = false
                    
                    this.$emit('saved-add', true, this.status)
                })
                .catch(error => {
                    this.errorMessage = error.message;
                    console.error("There was an error!", error);
                    this.$emit('saved-add', false, this.errorMessage)
                });
        }
    }
}
</script>

<style></style>