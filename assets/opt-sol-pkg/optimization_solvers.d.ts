/* tslint:disable */
/* eslint-disable */
export function create_vector(data: Float64Array): any;
export function log(message: string): void;
export class OptimizationResult {
  private constructor();
  free(): void;
  static new(): OptimizationResult;
  get_x(): Array<any>;
  get_f_value(): number;
  get_gradient_norm(): number;
  get_iterations(): number;
  get_success(): boolean;
  get_error_message(): string;
}
export class OptimizationSolver {
  private constructor();
  free(): void;
  static new(tolerance: number, max_iterations: number): OptimizationSolver;
  solve_gradient_descent(x0: Float64Array, f_and_g_fn: Function): OptimizationResult;
  solve_bfgs(x0: Float64Array, f_and_g_fn: Function): OptimizationResult;
  solve_newton(x0: Float64Array, f_and_g_and_h_fn: Function): OptimizationResult;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly __wbg_optimizationresult_free: (a: number, b: number) => void;
  readonly optimizationresult_new: () => number;
  readonly optimizationresult_get_x: (a: number) => any;
  readonly optimizationresult_get_f_value: (a: number) => number;
  readonly optimizationresult_get_gradient_norm: (a: number) => number;
  readonly optimizationresult_get_iterations: (a: number) => number;
  readonly optimizationresult_get_success: (a: number) => number;
  readonly optimizationresult_get_error_message: (a: number) => [number, number];
  readonly __wbg_optimizationsolver_free: (a: number, b: number) => void;
  readonly optimizationsolver_new: (a: number, b: number) => number;
  readonly optimizationsolver_solve_gradient_descent: (a: number, b: number, c: number, d: any) => number;
  readonly optimizationsolver_solve_bfgs: (a: number, b: number, c: number, d: any) => number;
  readonly optimizationsolver_solve_newton: (a: number, b: number, c: number, d: any) => number;
  readonly create_vector: (a: number, b: number) => any;
  readonly log: (a: number, b: number) => void;
  readonly __wbindgen_exn_store: (a: number) => void;
  readonly __externref_table_alloc: () => number;
  readonly __wbindgen_export_2: WebAssembly.Table;
  readonly __wbindgen_malloc: (a: number, b: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
  readonly __wbindgen_free: (a: number, b: number, c: number) => void;
  readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;
/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
*
* @returns {InitOutput}
*/
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
*
* @returns {Promise<InitOutput>}
*/
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
