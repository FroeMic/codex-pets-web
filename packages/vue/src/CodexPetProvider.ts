import {
  createCodexPetRegistry,
  type CodexPetConfig,
  type CodexPetId,
  type CodexPetRegistry
} from "codex-pet-web";
import {
  defineComponent,
  h,
  provide,
  shallowRef,
  watch,
  type PropType
} from "vue";
import { codexPetRegistryKey } from "./context.js";

export const CodexPetProvider = defineComponent({
  name: "CodexPetProvider",
  props: {
    defaultPetId: String,
    pets: Object as PropType<Record<CodexPetId, CodexPetConfig>>,
    registry: Object as PropType<CodexPetRegistry>
  },
  setup(props, { slots }) {
    const registryRef = shallowRef(
      props.registry ??
        createCodexPetRegistry({
          defaultPetId: props.defaultPetId,
          pets: props.pets
        })
    );

    watch(
      () => props.pets,
      (pets) => {
        if (!pets) {
          return;
        }

        for (const [id, config] of Object.entries(pets)) {
          registryRef.value.register(id, config);
        }
      },
      { deep: false }
    );

    provide(codexPetRegistryKey, registryRef.value);

    return () => h("div", { "data-codex-pet-provider": "" }, slots.default?.());
  }
});
