<template>
  <v-app>
    <v-main>
      <v-container class="fill-height" fluid>
        <v-row align="center" justify="center">
          <h2>Data Portal</h2>
          <v-col cols="12" sm="8" md="4">
            <v-card>
              <v-card-title class="justify-center"> Login </v-card-title>
              <v-card-text>
                <v-form @submit.prevent="login" ref="form">
                  <v-text-field
                    v-model="username"
                    label="Email Address"
                    prepend-icon="mdi-account"
                    required
                    :rules="[rules.required]"
                  ></v-text-field>
                  <v-text-field
                    v-model="password"
                    label="Password"
                    type="password"
                    prepend-icon="mdi-lock"
                    required
                    :rules="[rules.required]"
                  >
                    <template v-slot:append>
                      <a
                        class="forgotBtn"
                        @click="router.push('/forgotPassword')"
                      >
                        Forgot Password?
                      </a>
                    </template>
                  </v-text-field>
                  <v-card-actions>
                    <v-btn
                      :loading="loading"
                      color="primary"
                      type="submit"
                      class="loginBtn"
                    >
                      Login
                    </v-btn>
                    <v-spacer></v-spacer>
                    <v-btn to="/register" color="primary">Register</v-btn>
                  </v-card-actions>
                </v-form>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref } from "vue";

import { userApi } from "@/api";
import loginToFirmiana from "@/utils/loginToFirmiana";

import { useRouter } from "vue-router";

import { useUserStore } from "@/stores/user";

const router = useRouter();

const userStore = useUserStore();

const username = ref("");
const password = ref("");
const loading = ref(false);
const form = ref(null);

const rules = {
  required: (value) => !!value || "Required",
};

const login = async () => {
  const { valid } = await form.value.validate();
  if (!valid) return;
  loading.value = true;
  const data = {
    username: username.value,
    password: password.value,
  };
  try {
    const response = await loginToFirmiana.post(
      "/token?scope=profile&grant_type=password",
      data
    );
    userStore.setUser({
      firmianaToken: response.data,
    });

    try {
      const uesrData = {
        iproteome_token: response.data,
      };
      const userInfo = await userApi.login(uesrData);
      userStore.setUser({
        firmianaToken: response.data,
        userAccessToken: userInfo.access_token,
        userRefreshToken: userInfo.refresh_token,
      });
      loading.value = false;
      router.push({
        path: "/project",
        // 或使用命名路由（如果自动生成了名称）
        // name: 'project'
      });
    } catch (error) {
      console.error("获取用户信息失败:", error);
    }
  } catch (error) {
    console.error("认证失败:", error);
  }
};
</script>

<style lang="less" scoped>
.fill-height {
  min-height: 100vh;
  background-image: url("@/assets/Flux_Dev_Create_a_minimalistic_and_elegantly_flat_background_i_1.jpg") !important;
  background-size: 100% 100%;
  background-position: center;
  background-repeat: no-repeat;
  h2 {
    text-align: center;
    display: block;
    width: 100%;
    font-size: 30px;
  }
  .v-card-actions {
    flex-wrap: wrap;
    justify-content: flex-start;
  }
  .loginBtn {
    width: 200px;
    background: #1867c0;
    color: #fff !important;
    margin-left: 30px;
  }
  .forgotBtn {
    width: 100%;
    text-align: right;
    background: none;
    border: none;
    color: #1867c0;
    margin-left: 10px;
    cursor: pointer;
  }

  :deep(.v-input__append) {
    margin: 0 !important;
  }
}
</style>
<route>
{ meta: { layout: 'AuthLayout' } }
</route>