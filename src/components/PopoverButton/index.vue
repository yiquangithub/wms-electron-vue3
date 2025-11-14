<template>
  <el-popover
    v-if="componentOption.tip"
    v-model:visible="popoverVisible"
    popper-class="button-popover small-buttons"
    :placement="componentOption.placement || 'left'"
    :width="componentOption.width"
    trigger="click"
  >
    <div class="button-popover-tip">
      <svg-icon
        v-if="componentOption.svgIcon"
        :icon-class="componentOption.svgIcon"
        :style="componentOption.svgStyle"
      />
      <p>{{ componentOption.tip }}</p>
    </div>
    <div style="text-align: right; margin: 0">
      <el-button plain size="default" @click="popoverVisible = false"
        >取消</el-button
      >
      <el-button
        type="danger"
        size="default"
        :class="buttonClass(componentOption, 'popover')"
        @click="handleButtonClick(componentOption)"
      >
        {{ componentOption.confirm || "删除" }}
      </el-button>
    </div>
    <template #reference>
      <el-button
        :loading="dealLoading(componentOption)"
        :disabled="buttonCrossAttribute(componentOption, 'disabled')"
        :type="componentOption.type"
        :size="componentOption.size"
        :plain="componentOption.plain"
        :class="buttonClass(componentOption, 'popover')"
        text
      >
        <svg-icon
          v-if="componentOption.svgIconLeft"
          :icon-class="componentOption.svgIconLeft"
        />
        {{ componentOption.label }}
        <svg-icon
          v-if="componentOption.svgIconRight"
          :icon-class="componentOption.svgIconRight"
        />
      </el-button>
    </template>
  </el-popover>
</template>

<script setup>
import { computed, ref } from "vue";

const props = defineProps({
  componentOption: {
    type: Object,
    default: () => ({
      tip: "",
      placement: "left",
      width: "",
      svgIcon: "",
      svgStyle: "",
      confirm: "删除",
      label: "",
      type: "",
      size: "",
      plain: false,
      svgIconLeft: "",
      svgIconRight: "",
      popoverclass: "",
      loading: false,
      active: "",
    }),
  },
  scope: {
    type: Object,
    default: () => ({}),
  },
});

const emits = defineEmits(["deleteCameraEvent"]);

const popoverVisible = ref(false);

const dealLoading = computed(() => {
  return (button) => {
    if (props.scope && props.scope.row) {
      return props.scope.row.loading;
    } else {
      return button.loading;
    }
  };
});

const buttonClass = computed(() => {
  return (button, prop) => {
    const classGroup = {};

    if (!prop) {
      prop = "";
    }

    if (
      prop + "class" in button &&
      typeof button[prop + "class"] === "string"
    ) {
      button[prop + "class"].split(" ").forEach((item) => {
        classGroup[item] = true;
      });
    }

    classGroup["is-active"] = button.active;

    return classGroup;
  };
});

const buttonCrossAttribute = computed(() => {
  return (button, attribute, scene) => {
    return false;
  };
});

const handleButtonClick = (button) => {
  popoverVisible.value = false;
  emits("deleteCameraEvent");
};
</script>

<style scoped lang="scss">
.button-popover-tip {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 40px;

  & svg {
    font-size: 24px !important;
    color: #ff6f26;
    margin-right: 8px;
    flex-shrink: 0;
  }
}
</style>
