import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewChild
} from "@angular/core";
import {
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
import { CodexPetRegistryService } from "./codex-pet-registry.service";

function getDefinedConfig(
  config: Partial<CodexPetConfig>
): Partial<CodexPetConfig> {
  return Object.fromEntries(
    Object.entries(config).filter(([, value]) => value !== undefined)
  ) as Partial<CodexPetConfig>;
}

@Component({
  selector: "codex-pet",
  standalone: true,
  template: `
    <div
      #host
      [attr.aria-hidden]="ariaLabel ? null : 'true'"
      [attr.aria-label]="ariaLabel || null"
      [attr.data-codex-pet]="petId"
      [attr.role]="ariaLabel ? 'img' : null"
    ></div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CodexPetComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() id?: CodexPetId;
  @Input() manifest?: CodexPetManifest;
  @Input() spritesheetUrl?: string;
  @Input() state?: CodexPetState;
  @Input() scale?: number;
  @Input() fps?: number;
  @Input() stateFps?: CodexPetStateFps;
  @Input() paused?: boolean;
  @Input() reducedMotion?: ReducedMotionPreference;
  @Input() imageRendering = "pixelated";
  @Input() floating?: boolean | CodexPetFloatingOptions;
  @Input() draggable?: boolean | CodexPetDragOptions;
  @Input() preload?: boolean;
  @Input() ariaLabel?: string;

  @Output() ready = new EventEmitter<void>();
  @Output() petError = new EventEmitter<CodexPetErrorEvent>();
  @Output() stateChange = new EventEmitter<CodexPetStateChangeEvent>();
  @Output() animationStart = new EventEmitter<CodexPetAnimationEvent>();
  @Output() animationLoop = new EventEmitter<CodexPetAnimationEvent>();
  @Output() animationEnd = new EventEmitter<CodexPetAnimationEvent>();
  @Output() frameChange = new EventEmitter<CodexPetAnimationEvent>();
  @Output() petDragStart = new EventEmitter<CodexPetDragEvent>();
  @Output() petDrag = new EventEmitter<CodexPetDragEvent>();
  @Output() petDragEnd = new EventEmitter<CodexPetDragEvent>();

  @ViewChild("host", { static: true })
  private host?: ElementRef<HTMLDivElement>;

  private controller?: CodexPetController;
  private boundElement?: HTMLDivElement;

  constructor(private readonly pets: CodexPetRegistryService) {}

  get petId(): CodexPetId {
    return this.id ?? this.manifest?.id ?? "default";
  }

  ngAfterViewInit(): void {
    this.bind();
  }

  ngOnChanges(_changes: SimpleChanges): void {
    if (!this.controller) {
      return;
    }

    this.controller.setConfig(this.getConfig());
  }

  ngOnDestroy(): void {
    this.controller?.unbind(this.boundElement);
  }

  private bind(): void {
    const element = this.host?.nativeElement;

    if (!element) {
      return;
    }

    this.controller = this.resolveController();
    this.boundElement = element;
    this.controller.bind(element);
  }

  private resolveController(): CodexPetController {
    const petId = this.petId;

    if (this.pets.registry.has(petId)) {
      return this.pets.get(petId);
    }

    if (!this.spritesheetUrl) {
      return this.pets.get(petId);
    }

    return this.pets.register(petId, {
      ...this.getConfig(),
      spritesheetUrl: this.spritesheetUrl
    });
  }

  private getConfig(): Partial<CodexPetConfig> {
    return getDefinedConfig({
      spritesheetUrl: this.spritesheetUrl,
      state: this.state,
      scale: this.scale,
      fps: this.fps,
      stateFps: this.stateFps,
      paused: this.paused,
      reducedMotion: this.reducedMotion,
      imageRendering: this.imageRendering,
      floating: this.floating,
      draggable: this.getDragConfig(),
      preload: this.preload,
      onReady: () => this.ready.emit(),
      onError: (event) => this.petError.emit(event),
      onStateChange: (event) => this.stateChange.emit(event),
      onAnimationStart: (event) => this.animationStart.emit(event),
      onAnimationLoop: (event) => this.animationLoop.emit(event),
      onAnimationEnd: (event) => this.animationEnd.emit(event),
      onFrameChange: (event) => this.frameChange.emit(event)
    });
  }

  private getDragConfig(): boolean | CodexPetDragOptions | undefined {
    if (!this.draggable) {
      return undefined;
    }

    const userOptions =
      typeof this.draggable === "object" ? this.draggable : undefined;

    return {
      ...userOptions,
      onDragStart: (event) => {
        userOptions?.onDragStart?.(event);
        this.petDragStart.emit(event);
      },
      onDrag: (event) => {
        userOptions?.onDrag?.(event);
        this.petDrag.emit(event);
      },
      onDragEnd: (event) => {
        userOptions?.onDragEnd?.(event);
        this.petDragEnd.emit(event);
      }
    };
  }
}
