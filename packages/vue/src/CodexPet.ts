import {
  createCodexPetRegistry,
  type CodexPetAnimationEvent,
  type CodexPetConfig,
  type CodexPetController,
  type CodexPetDragEvent,
  type CodexPetDragOptions,
  type CodexPetErrorEvent,
  type CodexPetFloatingOptions,
  type CodexPetId,
  type CodexPetManifest,
  type CodexPetState,
  type CodexPetStateChangeEvent,
  type CodexPetStateFps,
  type ReducedMotionPreference
} from "codex-pet-web";
import {
  computed,
  defineComponent,
  h,
  inject,
  onBeforeUnmount,
  onMounted,
  ref,
  shallowRef,
  useAttrs,
  watch,
  type PropType
} from "vue";
import { codexPetRegistryKey } from "./context.js";

function getDefinedConfig(
  config: Partial<CodexPetConfig>
): Partial<CodexPetConfig> {
  return Object.fromEntries(
    Object.entries(config).filter(([, value]) => value !== undefined)
  ) as Partial<CodexPetConfig>;
}

export const CodexPet = defineComponent({
  name: "CodexPet",
  inheritAttrs: false,
  props: {
    id: String,
    manifest: Object as PropType<CodexPetManifest>,
    spritesheetUrl: String,
    state: String as PropType<CodexPetState>,
    scale: Number,
    fps: Number,
    stateFps: Object as PropType<CodexPetStateFps>,
    paused: Boolean,
    reducedMotion: [Boolean, String] as PropType<ReducedMotionPreference>,
    imageRendering: {
      type: String,
      default: "pixelated"
    },
    floating: [Boolean, Object] as PropType<boolean | CodexPetFloatingOptions>,
    draggable: [Boolean, Object] as PropType<boolean | CodexPetDragOptions>,
    preload: Boolean,
    ariaLabel: String
  },
  emits: {
    ready: () => true,
    error: (_event: CodexPetErrorEvent) => true,
    stateChange: (_event: CodexPetStateChangeEvent) => true,
    animationStart: (_event: CodexPetAnimationEvent) => true,
    animationLoop: (_event: CodexPetAnimationEvent) => true,
    animationEnd: (_event: CodexPetAnimationEvent) => true,
    frameChange: (_event: CodexPetAnimationEvent) => true,
    petDragStart: (_event: CodexPetDragEvent) => true,
    petDrag: (_event: CodexPetDragEvent) => true,
    petDragEnd: (_event: CodexPetDragEvent) => true
  },
  setup(props, { emit, expose }) {
    const attrs = useAttrs();
    const element = ref<HTMLElement | null>(null);
    const contextRegistry = inject(codexPetRegistryKey, null);
    const localRegistry = shallowRef<ReturnType<
      typeof createCodexPetRegistry
    > | null>(null);
    const petId = computed(() => props.id ?? props.manifest?.id ?? "default");

    const config = computed(() =>
      getDefinedConfig({
        spritesheetUrl: props.spritesheetUrl,
        state: props.state,
        scale: props.scale,
        fps: props.fps,
        stateFps: props.stateFps,
        paused: props.paused,
        reducedMotion: props.reducedMotion,
        imageRendering: props.imageRendering,
        floating: props.floating,
        draggable:
          props.draggable && typeof props.draggable === "object"
            ? {
                ...props.draggable,
                onDragStart: (event) => {
                  props.draggable && typeof props.draggable === "object"
                    ? props.draggable.onDragStart?.(event)
                    : undefined;
                  emit("petDragStart", event);
                },
                onDrag: (event) => {
                  props.draggable && typeof props.draggable === "object"
                    ? props.draggable.onDrag?.(event)
                    : undefined;
                  emit("petDrag", event);
                },
                onDragEnd: (event) => {
                  props.draggable && typeof props.draggable === "object"
                    ? props.draggable.onDragEnd?.(event)
                    : undefined;
                  emit("petDragEnd", event);
                }
              }
            : props.draggable
              ? {
                  onDragStart: (event) => emit("petDragStart", event),
                  onDrag: (event) => emit("petDrag", event),
                  onDragEnd: (event) => emit("petDragEnd", event)
                }
              : undefined,
        preload: props.preload,
        onReady: () => emit("ready"),
        onError: (event) => emit("error", event),
        onStateChange: (event) => emit("stateChange", event),
        onAnimationStart: (event) => emit("animationStart", event),
        onAnimationLoop: (event) => emit("animationLoop", event),
        onAnimationEnd: (event) => emit("animationEnd", event),
        onFrameChange: (event) => emit("frameChange", event)
      })
    );

    if (!contextRegistry && !localRegistry.value) {
      if (!props.spritesheetUrl) {
        throw new Error(
          "CodexPet requires spritesheetUrl when used without CodexPetProvider."
        );
      }

      localRegistry.value = createCodexPetRegistry({
        defaultPetId: petId.value,
        pets: {
          [petId.value]: { ...config.value, spritesheetUrl: props.spritesheetUrl }
        }
      });
    }

    const registry = contextRegistry ?? localRegistry.value;

    if (!registry) {
      throw new Error("CodexPet could not create a pet registry.");
    }

    const controller: CodexPetController = registry.has(petId.value)
      ? registry.get(petId.value)
      : props.spritesheetUrl
        ? registry.register(petId.value, {
            ...config.value,
            spritesheetUrl: props.spritesheetUrl
          })
        : registry.get(petId.value);

    watch(
      config,
      (nextConfig) => {
        controller.setConfig(nextConfig);
      },
      { deep: false }
    );

    onMounted(() => {
      if (element.value) {
        controller.bind(element.value);
      }
    });

    onBeforeUnmount(() => {
      controller.unbind(element.value ?? undefined);
    });

    expose({
      controller,
      play: controller.play.bind(controller),
      setState: controller.setState.bind(controller),
      hide: controller.hide.bind(controller),
      show: controller.show.bind(controller),
      remove: controller.remove.bind(controller),
      setPosition: controller.setPosition.bind(controller),
      getSnapshot: controller.getSnapshot.bind(controller)
    });

    return () =>
      h("div", {
        ...attrs,
        "aria-hidden": props.ariaLabel ? undefined : "true",
        "aria-label": props.ariaLabel,
        "data-codex-pet": petId.value,
        ref: element,
        role: props.ariaLabel ? "img" : undefined
      });
  }
});
