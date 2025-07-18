<template>
    <div class="card shadow-sm" v-on:click="countClicks">
        <div class="card-body">
            <div class="row">
                <div class="col">
                    <h3>Edit Task</h3>
                </div>
                <div class="col text-end">
                    <button class="btn btn-outline-secondary" @click="cancel">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-square" viewBox="0 0 16 16">
                            <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2z"/>
                            <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708"/>
                        </svg>
                    </button>
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
            <form v-show="showForm" v-on:submit.prevent="saveEditedItem">
                <div class="row mb-3">
                    <label for="title"  class="col-sm-2 col-form-label">Title: </label>
                    <div class="col-sm-10">
                        <input id="title" v-model="editItemTitle" ref="editItemTitle" required>
                    </div>
                </div>
                <div class="row mb-3">
                    <label for="description"  class="col-sm-2 col-form-label">Description: </label>
                    <div class="col-sm-10">
                        <textarea id="description" placeholder="Description" rows="4" cols="50" class="form-control" v-model="editItemDescription" />
                    </div>
                </div>
                <div class="row mb-3">
                    <label for="creator_id"  class="col-sm-2 col-form-label">Creator: </label>
                    <div class="col-sm-10">
                        <input id="creator_id" type="number" v-model="editItemCreator">
                    </div>
                </div>
                <button class="btn btn-primary" type="submit">Save</button>
                <button class="btn btn-secondary" type="reset">Reset</button>
            </form>
        </div>
    </div>
</template>


<script>
import axios from 'axios';

export default {
    data() {
        console.log("data")
        return {
            showForm: true,
            result: null,
            editItemId: this.itemId,
            editItemTitle: "",
            editItemDescription: "",
            editItemCreator: null,
            status: "",
            errorMessage: ""
        }
    },
    props: {
        itemId: {
            type: Number,
            required: true,
            validator: function (value) {
                if (value > 0) {
                    return true;
                }
                else {
                    return false;
                }
            }
        }
    },
    created() {
        console.log("created, id: " + this.itemId)
        this.fetchData()
    },
    activated() {
        console.log("activated, id: " + this.itemId)
    },
    mounted() {
        console.log("mounted, id: " + this.itemId)
        this.$refs.editItemTitle.focus()
    },
    emits: [
        'saved-edit',
        'cancelled-edit'
    ],
    methods: {
        cancel() {
            this.$emit('cancelled-edit')
        },
        async saveEditedItem() {
            // todo: do some consistency checks here
            const dataToSave = {
                id: this.editItemId,
                title: this.editItemTitle,
                description: this.editItemDescription,
                creator: { id: this.editItemCreator }
            }
            // async //const result = await axios.put("http://localhost:8088/rest/tasks", dataToSave)

            // Example from https://jasonwatmore.com/post/2022/06/09/vue-fetch-http-put-request-examples
            // PUT request using fetch with error handling
            const requestOptions = {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify( dataToSave )
            };
            fetch("/api/tasks", requestOptions)
                .then(async response => {
                        const isJson = response.headers.get('content-type').includes('application/json');
                        const data = isJson && await response.json();

                        console.log(response);

                        // check for error response
                        if (!response.ok) {
                            // get error message from body or default to response status
                            const error = (data && data.message) || response.status;
                            return Promise.reject(error);
                        }

                        this.status = "The item was saved "
                        this.showForm = false
                    
                        this.$emit('saved-edit', true, this.status)
                    })
                .catch(error => {
                        this.errorMessage = 'There was an error: ' + error;
                        console.error('There was an error!', error);
                        this.$emit('saved-edit', false, this.errorMessage)
                    });
        },
        async fetchData() {
            console.log("fetchData")
            //this.data = await axios.get("https://random-data-api.com/api/v2/users")
            const tmpResult = await axios.get("/api/tasks/" + this.editItemId)
            this.result = tmpResult.data

            this.editItemTitle = tmpResult.data.title
            this.editItemDescription = tmpResult.data.description
            this.editItemCreator = tmpResult.data.creator
            console.log(tmpResult.data)
        }
    }
}
</script>


<style></style>