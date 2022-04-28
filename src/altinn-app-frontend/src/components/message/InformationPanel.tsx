import React from 'react';

export type InformationType = 'message' | 'info' | 'error' | 'success';


interface InformationPanelProps {
  id: string;
  children: React.ReactNode;
  type : InformationType;

}


export default function InformationPanel({ id, type }: InformationPanelProps) {
  return (
    <div id={id}> Here comes the information panel </div>
  )
}