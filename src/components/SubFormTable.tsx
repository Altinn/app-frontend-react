import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { v4 as uuidv4 } from 'uuid';

export function SubFormTable(): React.JSX.Element | null {
  const location = useLocation();
  const navigate = useNavigate();

  const navigateToSubForm = () => {
    const currentRelativePath = location.pathname;
    const newId = uuidv4();
    const subFormPath = `${currentRelativePath}/${newId}`;
    navigate(subFormPath);
  };

  return (
    <div>
      <h1>SubFormTable</h1>
      <button onClick={navigateToSubForm}>Go to sub form</button>
    </div>
  );
}
