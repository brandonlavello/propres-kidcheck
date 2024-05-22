<template>
    <section class="section section-shaped section-lg my-0">
        <div class="shape shape-style-1 bg-gradient-default">
            <span></span>
            <span></span>
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
                <div style="height: 60vh;" class=" col-lg-8">
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
                                        The following computers didn't work:
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
                                        placeholder="Kid Check Number" addon-left-icon="ni ni-align-left-2">
                                    </base-input>
                                    <div class="text-center">
                                        <base-button @click="onSubmit" type="primary" class="my-4">Submit</base-button>
                                        <base-button @click="clearNumber" type="primary"
                                            class="my-4">Clear</base-button>
                                    </div>
                                </form>
                            </template>
                        </card>

                        <span><br></span>
                        <span><br></span>

                        <card type="secondary" shadow header-classes="bg-white pb-5" body-classes="px-lg-5 py-lg-5"
                            class="border-0">
                            <template>
                                <div class="text-muted text-center mb-3">
                                    <h2>Currently Displaying</h2>
                                    <h3 style="white-space: pre-line;">{{ current_message }}</h3>
                                </div>
                            </template>
                        </card>

                        <!-- <div class="row justify-content-center">
                            <base-button type="primary" class="btn btn-neutral btn-icon" @click="modals.modal0 = true">
                                Set IP Addresses
                            </base-button>
                            <modal :show.sync="modals.modal0">
                                <template slot="header">
                                    <h5 class="modal-title" id="exampleModalLabel">Set IP Addresses</h5>
                                </template>
                                <div>
                                    <base-input v-model="new_url[0]" alternative class="mb-3" placeholder="IP Address 1"
                                        addon-left-icon="ni ni-align-left-2">
                                    </base-input>
                                    <base-input v-model="new_url[1]" alternative class="mb-3" placeholder="IP Address 2"
                                        addon-left-icon="ni ni-align-left-2">
                                    </base-input>
                                </div>
                                <template slot="footer">
                                    <base-button type="secondary" @click="modals.modal0 = false">Close</base-button>
                                    <base-button type="primary">Save changes</base-button>
                                </template>
                            </modal>

                        </div> -->

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
import { reactive, provide } from 'vue';

const message = ref('')

export default {

  data() {
    return {
      new_message: '',
      current_message: '',
      url: ['http://10.10.10.117:1025/v1/stage/message'],
      new_url: [''],
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
            const getUrl = 'http://10.10.10.117:1025/v1/stage/message?chunked=false';

            try {
                const response = await get(getUrl, { 'accept': '*/*' });
                console.log("Get Response", response);
                this.current_message = response;
            } catch (err) {
                // Handle
            }
        },
        async onSubmit() {
            this.successfulUrls = [];
            this.failedUrls = [];
            this.showSuccessAlert = false; // Hide the alert before starting

            try {
                for (const url of this.url) {
                    await this.submitNumber(url);
                }
            } catch (err) {
                console.error('Error during submit:', err);
            }

            // Finalize the success alert visibility after all URLs are processed
            this.manageSuccessAlertVisibility();
        },
        async submitNumber(url) {
            try {
                const response = await put(url, this.new_message, {'accept': '*/*'});
                if (response) {
                this.current_message = this.new_message;
                this.new_message = '';
                console.log("Message set successfully for URL:", url);
                this.successfulUrls.push(url);
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
            this.current_message = '';
            try {
                const response = await put(this.url[0], this.current_message, {'accept': '*/*'});
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
