<template>
    <div>
        <h1>Task Cards</h1>
        <p>{{ status }}</p>
        <p>{{ errorMessage }}</p>
        <p><button class="btn btn-primary" @click="showAddItem = true" v-show="!showAddItem">+</button></p>
        <div class="container">
            <add-task-item v-show="showAddItem" @cancelled-add="cancelledAdd" @saved-add="savedAdd" />
            <edit-task-item :item-id="editItemId" v-if="showEditItem" @cancelled-edit="cancelledEdit"
                @saved-edit="savedEdit" />
        </div>
        <div class="container">
            <div class="row g-3 row-cols-1 row-cols-sm-2 row-cols-md-3">
                <task-item v-for="x in items" :key="x.id" :item-id="x.id" :item-title="x.title"
                    :item-description="x.description" :item-creator="x.creator" :is-favorite="x.favorite"
                    @edit-item="editItem" @delete-item="deleteItem" />
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
        savedAdd() {
            this.fetchAllData()
            this.showAddItem = false
        },
        cancelledEdit() {
            this.editItemId = null
            this.showEditItem = false
        },
        savedEdit() {
            this.fetchAllData()
            this.showEditItem = false
        },
        async deleteItem(itemId) {
            //const removed = this.items.filter(((item) => item.id !== itemId))
            //this.items = removed

            // DELETE request using fetch with error handling
            fetch('http://localhost:8088/rest/tasks/' + itemId, { method: 'DELETE' })
                .then(async response => {
                    const isJson = response.headers.get('content-type').includes('application/json');
                    const data = isJson && await response.json();

                    // check for error response
                    if (!response.ok) {
                        // get error message from body or default to response status
                        const error = (data && data.message) || response.status;
                        return Promise.reject(error);
                    }

                    this.status = 'Delete successful';
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

<style>
#wrapper {
    display: flex;
    flex-wrap: wrap;
}

#wrapper>div {
    border: dashed black 1px;
    margin: 10px;
    padding: 10px;
    background-color: lightgreen;
}
</style>