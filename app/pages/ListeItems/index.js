import React, { useEffect, useState } from 'react';
import { QItemsQuery as getItemsQuery } from '../../_graphql/queries/QItems';
import { fetchQuery, useRelayEnvironment } from 'react-relay';
import { ThComponent, TbodyComponent } from './tableComponents';
import { ModalComponent } from './modalComponents';
import { useItem } from '../../hooks';

const ListeItems = () => {
  const environment = useRelayEnvironment();
  const [hasBeenCancelled, setHasBeenCancelled] = useState(false);
  const [items, setItems] = useState(null);
  const [isModal, setIsModal] = useState(false);
  const [isError, setIsError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { getItems: result } = await fetchQuery(environment, getItemsQuery, {}).toPromise();
        if (!(result.ok)) setIsError(result.error);
        else if (!hasBeenCancelled) setItems(result.items);
      } catch (err) {
        console.error('error ', err);
        setIsError('Une erreur est survenue');
      }
    };
    fetchData();

    return () => setHasBeenCancelled(true);
  }, [hasBeenCancelled]);

  const addItem = createdItem => createdItem && setItems([...items, createdItem]);
  const onCreateItem = itemToCreate => {
    useItem(addItem, setIsError, hasBeenCancelled).onCreateItem(itemToCreate);
    setIsModal(false);
  };

  const removeItem = itemIdToDelete => {
    if (itemIdToDelete) {
      var localItems = [...items];
      localItems.splice(items.findIndex(item => item._id === itemIdToDelete), 1);
      setItems(localItems);
    }
  };
  const onDeleteItem = itemIdToDelete => useItem(removeItem, setIsError, hasBeenCancelled).onDeleteItem(itemIdToDelete);

  return (
    <>
      { isError ? <>{isError}</>
        : items &&
        <>
          <button
            name='itemCreationModal'
            onClick={ () => setIsModal(true) }
            className="my-10 bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded"
            type="button"
            data-modal-toggle="itemCreationModal"
          >
            AJOUTER UN ITEM
          </button>

          { isModal && <ModalComponent setIsModal={setIsModal} onCreateItem={onCreateItem} /> }

          <table className='min-w-full'>
            <thead className='bg-white border-b'>
              <tr>
                <ThComponent label='Nom'/>
                <ThComponent label='Catégorie'/>
                <ThComponent label="Groupe"/>
                <ThComponent label='Date de création'/>
                <ThComponent label='Date de mise à jour'/>
              </tr>
            </thead>
            <tbody>
              <TbodyComponent items={items} onDeleteItem={onDeleteItem} />
            </tbody>
          </table>
        </>
      }
    </>
  );
};

export default ListeItems;
