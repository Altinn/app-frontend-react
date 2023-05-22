import React, { useEffect } from 'react';

import { Button, FieldSet, Select, Spinner } from '@digdir/design-system-react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

import { appFrontendCDNPath, appPath, frontendVersionsCDN } from 'src/utils/urls/appUrlHelper';

export const VersionSwitcher = () => {
  const [selectedVersion, setSelectedVersion] = React.useState<string>('');
  const [newDocument, setNewDocument] = React.useState<string>('');
  const { data, isLoading, isError } = useQuery({
    queryKey: ['frontendVersions'],
    queryFn: () => axios.get(frontendVersionsCDN).then((res) => res.data),
    select: (data: string[]) => data.slice().reverse(),
  });

  const onClick = () => {
    document.open();
    document.write(newDocument);
    document.close();
  };

  /* 
    The fetching had to be separated into a useEffect because document.open()/document.write() was not allowed in an async callback.
   */
  useEffect(() => {
    setNewDocument('');
    axios.get(appPath).then(({ data }) => {
      const newDoc = data
        .replace(
          /src=".*\/altinn-app-frontend.js"/,
          `src="${appFrontendCDNPath}/${selectedVersion}/altinn-app-frontend.js"`,
        )
        .replace(
          /href=".*\/altinn-app-frontend.css"/,
          `href="${appFrontendCDNPath}/${selectedVersion}/altinn-app-frontend.css"`,
        );
      setNewDocument(newDoc);
    });
  }, [selectedVersion]);

  if (isLoading) {
    return <Spinner title={'Laster...'} />;
  }

  if (isError) {
    return <p>Det skjedde en feil ved henting av versjoner</p>;
  }

  return (
    <FieldSet
      legend='Frontend versjon'
      style={{ width: 250 }}
    >
      <Select
        value={selectedVersion}
        options={data.map((v) => ({ label: v, value: v }))}
        onChange={(value) => setSelectedVersion(value)}
      />
      <Button
        style={{ width: '100%' }}
        disabled={!newDocument}
        onClick={onClick}
      >
        Bytt versjon
      </Button>
    </FieldSet>
  );
};
