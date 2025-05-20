// // src/next-prev/loaders/taskLoader.ts
// import type { LoaderFunctionArgs } from 'react-router-dom';
//
// import { layoutStore } from 'src/next-prev/stores/layoutStore';
//
// export async function taskLoader({ params }: LoaderFunctionArgs) {
//   console.log('task loader');
// =======
// import { API_CLIENT, APP, ORG } from 'src/next-prev/app/App/App';
// import { layoutStore } from 'src/next-prev/stores/layoutStore';
//
// export async function taskLoader({ params }: LoaderFunctionArgs) {
// >>>>>>> next-poc-expressions
//   const taskId = params.taskId;
//   if (!taskId) {
//     throw new Error('Missing taskId param');
//   }
//
//   // We need the layoutSetsConfig from the store
//   const lstate = layoutStore.getState();
// <<<<<<< HEAD
//   debugger;
// =======
//
// >>>>>>> next-poc-expressions
//   const { layoutSetsConfig } = lstate;
//
//   if (!layoutSetsConfig) {
//     throw new Error('No layoutSetsConfig in store');
//   }
//
//   // Identify the relevant layout set for the given taskId
//   const currentLayoutSet = layoutSetsConfig.sets.find((layoutSet) => layoutSet.tasks.includes(taskId));
//
//   if (!currentLayoutSet?.id) {
//     throw new Error('Layoutset for task not found');
//   }
//
//   // Fetch the layout details
//   const res = await API_CLIENT.org.layoutsAllSettingsDetail(currentLayoutSet.id, ORG, APP);
//   const data = await res.json();
//
//   // Extract settings/layout JSON
//   const settings = JSON.parse(data.settings);
//   const layouts = JSON.parse(data.layouts);
//
// <<<<<<< HEAD
// =======
//   debugger;
//
// >>>>>>> next-poc-expressions
//   // Update the layout store
//   layoutStore.getState().setPageOrder(settings);
//   layoutStore.getState().setLayouts(layouts);
//
//   // Return anything the <Task> component may want directly.
//   return {
//     currentLayoutSet,
//     pageOrder: settings,
//     layouts,
//   };
// }
