import FormBuilder from './formBuilder/FormBuilder';
import PredefinedGallery from './formBuilder/PredefinedGallery';
import {
  addCardObj,
  addSectionObj,
  generateElementPropsFromSchemas,
  generateSchemaFromElementProps,
  generateUiSchemaFromElementProps,
  generateCategoryHash,
} from './formBuilder/utils';

export type {
  ElementProps,
  FormInput,
  Mods,
  CardProps,
  SectionProps,
} from './formBuilder/types';

export {
  FormBuilder,
  PredefinedGallery,
  addCardObj,
  addSectionObj,
  // The schema <-> element conversion engine — lets consumers build a custom
  // builder UI on top of the same battle-tested RJSF schema/uiSchema round-trip
  // (handles widgets, formats, expectedAnswer, and dependencies). Pair
  // generateElementPropsFromSchemas (with generateCategoryHash) for parsing with
  // generateSchema/UiSchemaFromElementProps for serializing.
  generateElementPropsFromSchemas,
  generateSchemaFromElementProps,
  generateUiSchemaFromElementProps,
  generateCategoryHash,
};
