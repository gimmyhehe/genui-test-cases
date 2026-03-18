<template>
  <div class="user-profile">
    <div class="avatar">
      <img v-if="avatar" referrerpolicy="no-referrer" :src="avatar" :alt="name" />
      <div v-else class="avatar-placeholder">{{ name?.[0] || 'U' }}</div>
    </div>
    <div class="user-info">
      <div class="user-name">{{ name }}</div>
      <div v-if="email" class="user-email">{{ email }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  name?: string;
  email?: string;
  avatar?: string;
}>();
</script>

<style scoped>
.user-profile {
  display: flex;
  align-items: center;
  padding: 16px;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  margin: 16px 0;
  background: #fff;
}

.avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 14px;
  flex-shrink: 0;
  background: #f3f4f6;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
  background: #111827;
  color: #fff;
  font-size: 20px;
  font-weight: 700;
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
}

.user-email {
  margin-top: 4px;
  font-size: 13px;
  color: #6b7280;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>

