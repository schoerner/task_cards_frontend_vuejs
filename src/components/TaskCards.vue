<template>
    <div>
        <div class="container">
            <div class="row">
                <div class="col">
                    <h1>Task Cards</h1>
                </div>
                <div class="col text-end">
                    <button class="btn btn-primary" @click="showAddItem = true" v-show="!showAddItem">+</button>
                </div>
            </div>
            <div class="row" v-if="status">
                <div class="alert alert-success" role="alert">
                    <h4 class="alert-heading">Success!</h4>
                    <p>{{ status }}</p>
                    <button @click="status=''" class="btn btn-primary">OK</button>
                </div>
            </div>
            <div class="row" v-if="errorMessage">
                <div class="alert alert-danger d-flex align-items-center" role="alert">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-exclamation-triangle" viewBox="0 0 16 16">
                        <path d="M7.938 2.016A.13.13 0 0 1 8.002 2a.13.13 0 0 1 .063.016.15.15 0 0 1 .054.057l6.857 11.667c.036.06.035.124.002.183a.2.2 0 0 1-.054.06.1.1 0 0 1-.066.017H1.146a.1.1 0 0 1-.066-.017.2.2 0 0 1-.054-.06.18.18 0 0 1 .002-.183L7.884 2.073a.15.15 0 0 1 .054-.057m1.044-.45a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767z"/>
                        <path d="M7.002 12a1 1 0 1 1 2 0 1 1 0 0 1-2 0M7.1 5.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0z"/>
                    </svg>
                    <div>
                        <p>{{ errorMessage }}</p>
                    </div>
                    <button @click="errorMessage=''" class="btn btn-primary">OK</button>
                </div>
            </div>
            <div class="row">
                <add-task-item v-show="showAddItem" @cancelled-add="cancelledAdd" @saved-add="savedAdd" />
                <edit-task-item :item-id="editItemId" v-if="showEditItem" @cancelled-edit="cancelledEdit"
                    @saved-edit="savedEdit" />
            </div>
            <div class="row">
                <div class="row g-3 row-cols-1 row-cols-sm-2 row-cols-md-3">
                    <task-item v-for="x in items" :key="x.id" :item-id="x.id" :item-title="x.title"
                        :item-description="x.description" :item-creator="x.creator"
                        @edit-item="editItem" @delete-item="deleteItem" />
                </div>
            </div>
        </div>
    </div>
</template>

<script>

import axios from 'axios';
import TaskItem from './TaskItem.vue'
import AddTaskItem from './AddTaskItem.vue'
import EditTaskItem from './EditTaskItem.vue'

export default {
    data() {
        return {
            result: null,
            items: null,
            showAddItem: false,
            showEditItem: false,
            editItemId: null,
            status: "",
            errorMessage: ""
        };
    },
    created() {
        // Initialize data by http get
        this.fetchAllData()
        //console.log("Component created")
    },
    mounted() {
    },
    components: {
        'task-item': TaskItem,
        'add-task-item': AddTaskItem,
        'edit-task-item': EditTaskItem
    },
    methods: {
        editItem(id) {
            this.editItemId = id
            this.showEditItem = true
        },
        cancelledAdd() {
            this.showAddItem = false
        },
        savedAdd(successfully, message) {
            if(!successfully) {
                this.errorMessage = message
                return
            }

            this.showAddItem = false
            this.status = message
            this.fetchAllData()
        },
        cancelledEdit() {
            this.editItemId = null
            this.showEditItem = false
        },
        savedEdit(successfully, message) {
            if(!successfully) {
                this.errorMessage = message
                return
            }

            this.showEditItem = false
            this.status = message
            this.fetchAllData()
        },
        async deleteItem(itemId) {
            //const removed = this.items.filter(((item) => item.id !== itemId))
            //this.items = removed

            // DELETE request using fetch with error handling
            fetch('http://localhost:8088/rest/tasks/' + itemId, { method: 'DELETE' })
                .then(async response => {
                    // check for error response
                    if (!response.ok) {
                        // get error message from body or default to response status
                        const error = (data && data.message) || response.status;
                        return Promise.reject(error);
                    }

                    this.status = 'The item with ID ' + itemId + ' was deleted successfully.'

                    this.fetchAllData()
                })
                .catch(error => {
                    this.errorMessage = error;
                    console.error('There was an error!', error);
                });
        },
        fetchAllData() {
            // asynch // const temp = await axios.get("http://localhost:8088/rest/tasks")
            /*temp.forEach((item) => {
              this.items.addItem(item.data)
            })*/
            // Quelle: https://jasonwatmore.com/post/2020/07/23/vue-axios-http-get-request-examples
            // GET request using axios with error handling
            axios.get("http://localhost:8088/rest/tasks")
                .then(response => this.items = response.data)
                .catch(error => {
                        this.errorMessage = "There was an error while loading the tasks: " + error.message;
                        console.error("There was an error!", error);
                    });
        }
    }
}

</script>

<style></style>