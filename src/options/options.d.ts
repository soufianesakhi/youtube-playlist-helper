interface Option {
  restore();
  save(): Promise<any>;
}
