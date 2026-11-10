import type { Scene } from "three";

export interface Frame {
  time: number;
  x: number;
  y: number;
  scroll: number;
  turn: number;
}
export type Model = (scene: Scene) => (frame: Frame) => void;
