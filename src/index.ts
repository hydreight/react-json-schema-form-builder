import FormBuilder from './formBuilder/FormBuilder';
import PredefinedGallery from './formBuilder/PredefinedGallery';
import {
  addCardObj,
  addSectionObj,
  generateElementPropsFromSchemas,
  generateSchemaFromElementProps,
  generateUiSchemaFromElementProps,
  generateCategoryHash,
  getCardCategory,
  getCardBody,
  parse,
  stringify,
  getRandomId,
  DEFAULT_INPUT_NAME,
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
  // Lower-level conversion utilities — let consumers build a custom builder UI
  // on top of the same battle-tested RJSF schema/uiSchema round-trip engine
  // (handles widgets, formats, expectedAnswer, and dependencies).
  generateElementPropsFromSchemas,
  generateSchemaFromElementProps,
  generateUiSchemaFromElementProps,
  generateCategoryHash,
  getCardCategory,
  getCardBody,
  parse,
  stringify,
  getRandomId,
  DEFAULT_INPUT_NAME,
};
