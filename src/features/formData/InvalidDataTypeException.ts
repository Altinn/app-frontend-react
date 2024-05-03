export class InvalidDataTypeException extends Error {
  public readonly dataType: string;

  constructor(dataType: string) {
    super(`Tried to reference a missing/invalid data model type \`${dataType}\``);
    this.dataType = dataType;
  }
}
