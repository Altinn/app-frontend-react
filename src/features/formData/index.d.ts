/**
 * This format is used to represent the form data in a flat structure. It has no hierarchy, and it's difficult to
 * work with objects and arrays in this format. Use it when you need direct access to leaf values (e.g. strings),
 * but use the object format when you need to work with objects and arrays.
 */
export interface IFormData {
  [dataFieldKey: string]: string;
}
