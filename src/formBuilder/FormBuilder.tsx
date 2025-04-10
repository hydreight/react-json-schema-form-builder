import React, { ReactElement, useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Alert, Input } from 'reactstrap';
import { createUseStyles } from 'react-jss';
import Card from './Card';
import Section from './Section';
import Add from './Add';
import { arrows as arrowsStyle } from './styles';
import {
  parse,
  stringify,
  checkForUnsupportedFeatures,
  generateElementComponentsFromSchemas,
  addCardObj,
  addSectionObj,
  onDragEnd,
  countElementsFromSchema,
  generateCategoryHash,
  excludeKeys,
  DROPPABLE_TYPE,
} from './utils';
import DEFAULT_FORM_INPUTS from './defaults/defaultFormInputs';
import type {
  Mods,
  InitParameters,
  AddFormObjectParametersType,
} from './types';

const useStyles = createUseStyles({
  formBuilder: {
    'text-align': 'center',
    '& .fa': {
      cursor: 'pointer',
    },
    '& .fa-question-circle, & .fa-circle-question': {
      color: 'gray',
    },
    '& .fa-asterisk': {
      'font-size': '.9em',
      color: 'green',
    },
    '& .fa-plus-square, & .fa-square-plus': {
      color: 'green',
      'font-size': '1.5em',
      margin: '0 auto',
    },
    ...arrowsStyle,
    '& .card-container': {
      display: 'block',
      width: '99%',
      'min-width': '400px',
      margin: '2em auto',
      border: '1px solid #E4E4E7',
      'border-radius': '4px',
      'background-color': 'white',
      '& h4': {
        width: '100%',
        'text-align': 'left',
        display: 'inline-block',
        margin: '0.25em .5em 0 .5em',
        'font-size': '18px',
      },
      '& .d-flex': {
        'border-bottom': '1px solid #E4E4E7',
      },
      '& .label': {
        float: 'left',
      },
    },
    '& .card-dependent': {
      border: '1px dashed gray',
    },
    '& .card-requirements': {
      border: '1px dashed black',
    },
    '& .section-container': {
      display: 'block',
      width: '100%',
      'min-width': '400px',
      margin: '2em auto',
      border: '1px solid #E4E4E7',
      'border-radius': '4px',
      'background-color': 'white',
      '& h4': {
        width: '100%',
        'text-align': 'left',
        display: 'inline-block',
        margin: '0.25em .5em 0 .5em',
        'font-size': '18px',
      },
      '& .d-flex': {
        'border-bottom': '1px solid #E4E4E7',
      },
      '& .label': {
        float: 'left',
      },
    },
    '& .section-dependent': {
      border: '1px dashed gray',
    },
    '& .section-requirements': {
      border: '1px dashed black',
    },
    '& .alert': {
      textAlign: 'left',
      width: '70%',
      margin: '1em auto',
      '& h5': {
        color: 'black',
        fontSize: '16px',
        fontWeight: 'bold',
        margin: '0',
      },
      '& .fa': { fontSize: '14px' },
    },
    '& .disabled-unchecked-checkbox': {
      color: 'gray',
      '& div::before': { backgroundColor: 'lightGray' },
    },
    '& .disabled-input': {
      '& input': { backgroundColor: 'lightGray' },
      '& input:focus': {
        backgroundColor: 'lightGray',
        border: '1px solid gray',
      },
    },
  },
  formHead: {
    // '& .form-title textarea, & .form-description textarea': {
    //   minHeight: '400px', // Adjust this value to your preferred height
    //   resize: 'vertical', // Allows vertical resizing
    // },
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto',
    'background-color': '#FAFAFA',
    border: '1px solid #E4E4E7',
    'border-radius': '4px',
    width: '100%',
    padding: '10px',
    '& div': {
      width: '50%',
      display: 'inline-block',
      'text-align': 'left',
      padding: '10px',
    },
    '& .form-title': {
      'text-align': 'left',
    },
    '& .form-description': {
      'text-align': 'left',
    },
    '& h5': {
      'font-size': '14px',
      'line-height': '21px',
      'font-weight': 'bold',
    },
  },
  formBody: {
    display: 'flex',
    flexDirection: 'column',
    '& .fa-pencil-alt, & .fa-pencil': {
      color: '#000000',
    },
    '& .modal-body': {
      maxHeight: '500px',
      overflowY: 'scroll',
    },
    '& .card-add': {
      cursor: 'pointer',
      display: 'block',
      color: '$green',
      fontSize: '1.5em',
    },
  },
  formFooter: {
    marginTop: '1em',
    textAlign: 'center',
    '& .fa': { cursor: 'pointer', color: '$green', fontSize: '1.5em' },
  },
});

export default function FormBuilder({
  schema,
  uischema,
  onMount,
  onChange,
  mods,
  className,
}: {
  schema: string;
  uischema: string;
  onMount?: (parameters: InitParameters) => any;
  onChange: (schema: string, uischema: string) => any;
  mods?: Mods;
  className?: string;
}): ReactElement {
  const classes = useStyles();
  const schemaData = parse(schema);
  schemaData.type = 'object';
  const uiSchemaData = parse(uischema);
  const allFormInputs = excludeKeys(
    Object.assign(
      {},
      DEFAULT_FORM_INPUTS,
      (mods && mods.customFormInputs) || {},
    ),
    mods && mods.deactivatedFormInputs,
  );

  const unsupportedFeatures = checkForUnsupportedFeatures(
    schemaData,
    uiSchemaData,
    allFormInputs,
  );

  const elementNum = countElementsFromSchema(schemaData);
  const defaultCollapseStates = [...Array(elementNum)].map(() => false);
  const [cardOpenArray, setCardOpenArray] = React.useState(
    defaultCollapseStates,
  );
  const categoryHash = generateCategoryHash(allFormInputs);

  const [isFirstRender, setIsFirstRender] = useState(true);

  const addProperties: AddFormObjectParametersType = {
    schema: schemaData,
    uischema: uiSchemaData,
    mods: mods,
    onChange: (
      newSchema: { [key: string]: any },
      newUiSchema: { [key: string]: any },
    ) => onChange(stringify(newSchema), stringify(newUiSchema)),
    definitionData: schemaData.definitions,
    definitionUi: uiSchemaData.definitions,
    categoryHash,
  };

  const hideAddButton =
    schemaData.properties && Object.keys(schemaData.properties).length !== 0;

  useEffect(() => {
    if (isFirstRender) {
      if (onMount)
        onMount({
          categoryHash,
        });
      setIsFirstRender(false);
    }
  }, [isFirstRender, onMount, categoryHash]);

  return (
    <div className={`${classes.formBuilder} ${className || ''}`}>
      <Alert
        style={{
          display: unsupportedFeatures.length === 0 ? 'none' : 'block',
        }}
        color='warning'
      >
        <h5>Unsupported Features:</h5>
        {unsupportedFeatures.map((message, index) => (
          <li key={index}>{message}</li>
        ))}
      </Alert>
      {(!mods || mods.showFormHead !== false) && (
        <div className={classes.formHead} data-test='form-head'>
          <div>
            <Input
              value={schemaData.title || ''}
              placeholder='Form name'
              type='textarea'
              onChange={(ev) => {
                onChange(
                  stringify({
                    ...schemaData,
                    title: ev.target.value,
                  }),
                  uischema,
                );
              }}
              className='form-title'
              style={{paddingBottom: '30px', paddingTop: '5px'}}
            />
          </div>
          <div>
            <Input
              value={schemaData.description || ''}
              placeholder='Form description'
              type='textarea'
              onChange={(ev) =>
                onChange(
                  stringify({
                    ...schemaData,
                    description: ev.target.value,
                  }),
                  uischema,
                )
              }
              className='form-description'
              style={{paddingBottom: '30px', paddingTop: '5px'}}
            />
          </div>
        </div>
      )}
      <div className={`form-body ${classes.formBody}`}>
        <DragDropContext
          onDragEnd={(result) =>
            onDragEnd(result, {
              schema: schemaData,
              uischema: uiSchemaData,
              onChange: (newSchema, newUiSchema) =>
                onChange(stringify(newSchema), stringify(newUiSchema)),
              definitionData: schemaData.definitions,
              definitionUi: uiSchemaData.definitions,
              categoryHash,
            })
          }
        >
          <Droppable droppableId='droppable' type={DROPPABLE_TYPE}>
            {(providedDroppable) => (
              <div
                ref={providedDroppable.innerRef}
                {...providedDroppable.droppableProps}
              >
                {generateElementComponentsFromSchemas({
                  schemaData,
                  uiSchemaData,
                  onChange: (newSchema, newUiSchema) =>
                    onChange(stringify(newSchema), stringify(newUiSchema)),
                  definitionData: schemaData.definitions,
                  definitionUi: uiSchemaData.definitions,
                  path: 'root',
                  cardOpenArray,
                  setCardOpenArray,
                  allFormInputs,
                  mods,
                  categoryHash,
                  Card,
                  Section,
                }).map((element: any, index) => (
                  <Draggable
                    key={element.key}
                    draggableId={element.key}
                    index={index}
                  >
                    {(providedDraggable) => (
                      <div
                        ref={providedDraggable.innerRef}
                        {...providedDraggable.draggableProps}
                        {...providedDraggable.dragHandleProps}
                      >
                        {element}
                      </div>
                    )}
                  </Draggable>
                ))}
                {providedDroppable.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
      <div className={`form-footer ${classes.formFooter}`}>
        {!hideAddButton &&
          mods?.components?.add &&
          mods.components.add(addProperties)}
        {!mods?.components?.add && (
          <Add
            tooltipDescription={((mods || {}).tooltipDescriptions || {}).add}
            labels={mods?.labels ?? {}}
            addElem={(choice: string) => {
              if (choice === 'card') {
                addCardObj(addProperties);
              } else if (choice === 'section') {
                addSectionObj(addProperties);
              }
            }}
            hidden={hideAddButton}
          />
        )}
      </div>
    </div>
  );
}
