<template>
  <v-container class="fill-height register-bg" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="4">
        <v-card>
          <v-card-title class="headline">Register Account</v-card-title>
          <v-card-text>
            <v-form ref="form" v-model="valid" lazy-validation>
              <v-text-field
                v-model="form.username"
                :rules="[(v) => !!v || 'Please enter a username']"
                label="Username"
                required
              ></v-text-field>
              <v-text-field
                v-model="form.email"
                :rules="[
                  (v) => /.+@.+\..+/.test(v) || 'Please enter a valid email',
                ]"
                label="Email"
                required
              ></v-text-field>
              <v-text-field
                v-model="form.password"
                :rules="[(v) => !!v || 'Please enter a password']"
                label="Password"
                type="password"
                required
              ></v-text-field>
              <v-text-field
                v-model="form.confirmPassword"
                :rules="[
                  (v) => v === form.password || 'Passwords do not match',
                ]"
                label="Confirm Password"
                type="password"
                required
              ></v-text-field>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-btn color="primary" :disabled="!valid" @click="register">
              Register
            </v-btn>
            <v-spacer></v-spacer>
            <v-btn text to="/login">Already have an account? Login</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, reactive } from "vue";

const valid = ref(false);
const form = ref({
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
});

function register() {
  if (valid.value) {
    // 注册逻辑
    alert("注册成功！");
  }
}
</script>

<style scoped>
.fill-height {
  min-height: 100vh;
  background-image: url("@/assets/Flux_Dev_Create_a_minimalistic_and_elegantly_flat_background_i_1.jpg") !important;
  background-size: 100% 100%;
  background-position: center;
  background-repeat: no-repeat;
}
</style>
<route>
{ meta: { layout: 'AuthLayout' } }
</route>