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
                  <!-- <template v-if="failedUrls.length > 0">
                    <strong> Error!</strong> The following computers didn't work:
                    <ul>
                      <li v-for="url in failedUrls" :key="url">{{ url }}</li>
                    </ul>
                  </template> -->
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
                  <base-input v-model="newMessage" alternative class="mb-3" placeholder="Kid Check Number"
                    addon-left-icon="ni ni-align-left-2" @keydown.enter="onSubmit">
                  </base-input>
                  <div class="text-center">
                    <base-button @click="onSubmit" type="primary" class="my-4">Submit</base-button>
                    <base-button @click="clearNumber" type="secondary" class="my-4">Clear</base-button>
                  </div>
                </form>
              </template>

            </card>

            <span><br></span>
            <span><br></span>

            <card type=" secondary" shadow header-classes="bg-white pb-5" body-classes="px-lg-5 py-lg-5"
              class="border-0">

              <template>
                <div class="text-muted text-center mb-3">
                  <h3>Output</h3>
                  <br>
                  <div class="message-container">
                    <base-button :type="campusStatus ? 'success' : 'danger'" class="btn-tooltip" v-b-tooltip.hover.top
                      :title="CAMPUS_BASE_URL">
                      Campus
                    </base-button>
                    <span class="message-text">{{ currentMessageCampus }}</span>
                  </div>
                  <br>

                  <div class="message-container">
                    <base-button :type="spanishStatus ? 'success' : 'danger'" class="btn-tooltip" v-b-tooltip.hover.top
                      :title="SPANISH_BASE_URL">
                      Spanish
                    </base-button>
                    <span class="message-text">{{ currentMessageSpanish }}</span>
                  </div>
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
import { VBTooltip } from "bootstrap-vue/esm/directives/tooltip/tooltip";
import { VBPopover } from "bootstrap-vue/esm/directives/popover/popover";
import "bootstrap-vue/dist/bootstrap-vue.min.css";

const message = ref('')
const CAMPUS_BASE_URL = 'http://10.10.21.13:1025';
const SPANISH_BASE_URL = 'http://10.10.21.14:1025';
const GET_PATH = '/v1/stage/message?chunked=false';
const POST_PATH =  '/v1/stage/message';

export default {

  data() {
    return {
      SPANISH_BASE_URL: SPANISH_BASE_URL,
      CAMPUS_BASE_URL: CAMPUS_BASE_URL,
      GET_PATH: GET_PATH,
      POST_PATH: POST_PATH,

      campusGetUrl: CAMPUS_BASE_URL + GET_PATH,
      campusPostUrl: CAMPUS_BASE_URL + POST_PATH,
      spanishGetUrl: SPANISH_BASE_URL + GET_PATH,
      spanishPostUrl: SPANISH_BASE_URL + POST_PATH,
      campusStatus: false,
      spanishStatus: false,

      newMessage: '',
      currentMessageCampus: '',
      currentMessageSpanish: '',

      showSuccessAlert: false,
      successfulUrls: [], // Array to store successful URLs
      failedUrls: [], // Array to store failed URLs
    }
  },
  directives: {
    BTooltip: VBTooltip,
    BPopover: VBPopover,
  },
  mounted() {
      this.fetchCurrentStageMessage();
      this.intervalId = setInterval(this.fetchCurrentStageMessage, 3000);
  },
  beforeUnmount() {
      clearInterval(this.intervalId);
  },
  components: {
      Modal
  },
  methods: {
    async fetchCurrentStageMessage(){
      const promises = [
        this.fetchMessage(this.campusGetUrl),
        this.fetchMessage(this.spanishGetUrl),
      ];
      
      const results = await Promise.allSettled(promises);

      results.forEach((result, index) => {
        const url = index === 0 ? this.campusGetUrl : this.spanishGetUrl;

        if (result.status === 'fulfilled') {
          // console.log(`Fetch successful for URL ${index === 0 ? this.campusGetUrl : this.spanishGetUrl}:`, result.value);
          if (url === this.campusGetUrl) {
            this.currentMessageCampus = result.value;
            this.campusStatus = true;
          }
          if (url === this.spanishGetUrl) {
            this.currentMessageSpanish = result.value;
            this.spanishStatus = true;
          }
        } else {
          console.error(`Error fetching from URL ${index === 0 ? this.campusGetUrl : this.spanishGetUrl}:`, result.reason);
          if (url === this.campusGetUrl) {
            this.currentMessageCampus = "Device offline."
            this.campusStatus = false;
          }
          if (url === this.spanishGetUrl) {
            this.currentMessageSpanish = "Device offline."
            this.spanishStatus = false;
          }
        }
      });

    },

    async fetchMessage(url) {
      try {
        const response = await fetch(url, { headers: { 'Accept': '*/*' } });
        if (!response.ok) {
          throw new Error(`Network response was not ok for ${url}`);
        }
        const data = await response.json();
        return data;

      } catch (error) {
        console.error(`Error fetching from URL ${url}:`, error);
        throw error;
      }
    },

    async onSubmit() {
      this.successfulUrls = [];
      this.failedUrls = [];
      this.showSuccessAlert = false; 

      const promises = [
        this.submitNumber(this.campusPostUrl),
        this.submitNumber(this.spanishPostUrl),
      ];
    
      try {
          await Promise.allSettled(promises);
      } catch (err) {
          console.error('Error during submit:', err);
      }

      // Finalize the success alert visibility after all URLs are processed
      this.manageSuccessAlertVisibility();
      this.newMessage = '';
    },

    async submitNumber(url) {
      try {
        const response = await fetch(url, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Accept': '*/*'
          },
          body: JSON.stringify(this.newMessage)
        });

        if (response.ok) {
          this.successfulUrls.push(url);
        } else {
          throw new Error('Network response was not ok');
        }
      } catch (err) {
        console.error('There was a problem setting the message for URL:', url, err);
        this.failedUrls.push(url);
      }
      this.manageSuccessAlertVisibility();

      await this.fetchCurrentStageMessage();
    },

    async clearNumber() {
      if (this.campusStatus) this.currentMessageCampus = '';
      if (this.spanishStatus) this.currentMessageSpanish = '';

      try {
        const responseCampus = await put(this.campusPostUrl, this.currentMessageCampus, {'accept': '*/*'});
        // console.log("Message cleared successfully for URL:", this.campusPostUrl);
      } catch (err) {
        console.error('There was a problem clearing the message for URL:', this.campusPostUrl, err);
      }

      try {
        const responseSpanish = await put(this.spanishPostUrl, this.currentMessageSpanish, { 'accept': '*/*' });
        // console.log("Message cleared successfully for URL:", this.spanishPostUrl);
      } catch (err) {
        console.error('There was a problem clearing the message for URL:', this.spanishPostUrl, err);
      }
    },

    manageSuccessAlertVisibility() {
      // console.log("Successful: ", this.successfulUrls);
      // console.log("Failed: ", this.failedUrls);
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

.message-container {
  display: flex;
  align-items: center;
  /* Align items vertically centered */
}

.message-text {
  margin-left: 10px;
  /* Adjust the space between the button and the text */
  white-space: pre-line;
  /* Ensure text preserves line breaks */
  color: black;
  size: 110%;
}
</style>
