<template>
    <section class="section section-shaped section-lg my-0">
        <div class="shape shape-style-1 bg-gradient-default">
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
        </div>
        <template>
        </template>
        <div class="container pt-lg-md">
            <div class="row justify-content-center">
                <div style="height: 70vh;" class=" col-lg-8">
                    <div class="card-container">
                        <card type="secondary" shadow header-classes="bg-white pb-5" body-classes="px-lg-5 py-lg-5"
                            class="border-0">
                            <template>
                                <base-alert v-if="showSuccessAlert" type="success">
                                    <strong>Success!</strong> The following computers worked:
                                    <ul>
                                        <li v-for="url in successfulUrls" :key="url">{{ url }}</li>
                                    </ul>
                                    <template v-if="failedUrls.length > 0">
                                        <strong> Error!</strong> The following computers didn't work:
                                        <ul>
                                            <li v-for="url in failedUrls" :key="url">{{ url }}</li>
                                        </ul>
                                    </template>
                                </base-alert>
                                <div class="text-muted text-center mb-3">
                                    <h2>Enter KidCheck Number</h2>
                                </div>
                                <span><br></span>
                                <div class="btn-wrapper text-center">
                                </div>
                            </template>
                            <template>
                                <form role="form">
                                    <base-input v-model="new_message" alternative class="mb-3"
                                        placeholder="Kid Check Number" addon-left-icon="ni ni-align-left-2"
                                        @keydown.enter="onSubmit">
                                    </base-input>
                                    <div class="text-center">
                                        <base-button @click="onSubmit" type="primary" class="my-4">Submit</base-button>
                                        <base-button @click="clearNumber" type="secondary"
                                            class="my-4">Clear</base-button>
                                    </div>
                                </form>
                            </template>
                        </card>

                        <span><br></span>
                        <span><br></span>

                        <card v-if="current_message_campus && current_message_campus" type=" secondary" shadow
                            header-classes="bg-white pb-5" body-classes="px-lg-5 py-lg-5" class="border-0">
                            <template>
                                <div class="text-muted text-center mb-3">
                                    <h2><strong>Currently Displaying</strong></h2>
                                    <h4 v-if="current_message_campus" style="white-space: pre-line;">
                                        <strong>Campus:</strong> {{
                                        current_message_campus }}
                                    </h4>
                                    <h4 v-else> <strong>Campus:</strong> Blank</h4>
                                    <h4 v-if="current_message_spanish" style="white-space: pre-line;">
                                        <strong>Spanish:</strong> {{
                                        current_message_spanish }}
                                    </h4>
                                    <h4 v-else> <strong>Spanish:</strong> Blank</h4>
                                </div>
                            </template>
                        </card>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>
<script>

import { ref } from 'vue';
import { get, post, put } from '@/helpers/fetchWrapper.js';
import Modal from '@/components/Modal.vue';

const message = ref('')

export default {

  data() {
    return {
      new_message: '',
      current_message_campus: '',
      current_message_spanish: '',
        url: ['http://10.10.10.10:1025/v1/stage/message?chunked=false', 'http://10.10.20.15:1025/v1/stage/message'],
      showSuccessAlert: false,
      successfulUrls: [], // Array to store successful URLs
      failedUrls: [], // Array to store failed URLs
        modals: {
            modal0: false,
        },
    }
  },
    mounted() {
        // Call fetchCurrentStageMessage() immediately when the component is mounted
        this.fetchCurrentStageMessage();

        // Set up an interval to call fetchCurrentStageMessage() every 3 seconds
        this.intervalId = setInterval(this.fetchCurrentStageMessage, 3000);
    },
    beforeUnmount() {
        // Clear the interval when the component is about to be unmounted
        clearInterval(this.intervalId);
    },
    components: {
        Modal // Register the modal component
    },
    methods: {
        async fetchCurrentStageMessage(){
            const getUrl = ['http://10.10.10.10:1025/v1/stage/message?chunked=false','http://10.10.20.15:1025/v1/stage/message'];
            try {
                const responseCampus = await get(getUrl[0], { 'accept': '*/*' });
                console.log("Get Response Campus", responseCampus);
                this.current_message_campus = responseCampus;

                const responseSpanish = await get(getUrl[1], { 'accept': '*/*' });
                console.log("Get Response Spanish", responseSpanish);
                this.current_message_spanish = responseSpanish;
            } catch (err) {
                // Handle
            }
        },
        async onSubmit() {
            this.successfulUrls = [];
            this.failedUrls = [];
            this.showSuccessAlert = false; // Hide the alert before starting

            const promises = this.url.map(url => this.submitNumber(url));

            try {
                await Promise.allSettled(promises);
            } catch (err) {
                console.error('Error during submit:', err);
            }

            // Finalize the success alert visibility after all URLs are processed
            this.manageSuccessAlertVisibility();
            this.new_message = '';
        },
        async submitNumber(url) {
            try {
                const response = await fetch(url, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': '*/*'
                    },
                    body: JSON.stringify(this.new_message)
                });

                if (response.ok) {
                    console.log("Message set successfully for URL:", url);
                    this.successfulUrls.push(url);
                } else {
                    throw new Error('Network response was not ok');
                }
            } catch (err) {
                console.error('There was a problem setting the message for URL:', url, err);
                this.failedUrls.push(url);
            }

            await this.fetchCurrentStageMessage();

            // Update the success alert visibility after each URL is processed
            this.manageSuccessAlertVisibility();
        },
        async clearNumber() {
                this.current_message_campus = '';
                this.current_message_spanish = '';
                try {
                    const responseCampus = await put(this.url[0], this.current_message_campus, {'accept': '*/*'});
                    console.log("Message cleared successfully for URL:", this.url[0]);
                } catch (err) {
                    console.error('There was a problem clearing the message for URL:', this.url[0], err);
                }
                try {
                    const responseSpanish = await put(this.url[1], this.current_message_spanish, { 'accept': '*/*' });
                    console.log("Message cleared successfully for URL:", this.url[0]);
                } catch (err) {
                    console.error('There was a problem clearing the message for URL:', this.url[0], err);
                }
            },
            manageSuccessAlertVisibility() {
                this.showSuccessAlert = true;
                clearTimeout(this.alertTimeout);
                this.alertTimeout = setTimeout(() => {
                    this.showSuccessAlert = false;
            }, 3000);
        }
    }
}
</script>

<style>
.card-container {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: flex-start;
}
</style>
