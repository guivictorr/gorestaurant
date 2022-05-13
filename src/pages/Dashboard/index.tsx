import {  useEffect, useState } from 'react';

import Header from '../../components/Header';
import api from '../../services/api';
import Food, { FoodParams } from '../../components/Food';
import ModalAddFood from '../../components/ModalAddFood';
import ModalEditFood from '../../components/ModalEditFood';
import { FoodsContainer } from './styles';

export type ModalState = {
  modalOpen: boolean;
  editModalOpen: boolean;
  foods: FoodParams[];
  editingFood: Partial<FoodParams>;
}

function Dashboard() {
  const [modalState, setModalState] = useState<ModalState>({
    foods: [],
    editingFood: {},
    modalOpen: false,
    editModalOpen: false,
  });

  useEffect(() => {
    api.get('/foods').then(response => {
      setModalState(prevState => ({
        ...prevState,
        foods: response.data,
      }))
    });
  }, [])

  const handleAddFood = async (food: FoodParams) => {
    try {
      const response = await api.post('/foods', {
        ...food,
        available: true,
      });

      setModalState(prevState => ({
        ...prevState,
        foods: [...prevState.foods, response.data],
      }))
    } catch (err) {
      console.log(err);
    }
  }

  const handleUpdateFood = async (food: FoodParams) => {
    try {
      const foodUpdated = await api.put(
        `/foods/${modalState.editingFood.id}`,
        { ...modalState.editingFood, ...food },
      );

      const foodsUpdated = modalState.foods.map(f =>
        f.id !== foodUpdated.data.id ? f : foodUpdated.data,
      );

      setModalState(prevState => ({
        ...prevState,
        foods: foodsUpdated,
      }))
    } catch (err) {
      console.log(err);
    }
  }

  const handleDeleteFood = async (id: number) => {
    await api.delete(`/foods/${id}`);

    const foodsFiltered = modalState.foods.filter(food => food.id !== id);

    setModalState({
      ...modalState,
      foods: foodsFiltered,
    })
  }

  const toggleModal = () => {
    setModalState(prevState => ({
      ...prevState,
      modalOpen: !prevState.modalOpen,
    }))
  }

  const toggleEditModal = () => {
    setModalState({
      ...modalState,
      editModalOpen: !modalState.editModalOpen,
    })
  }

  const handleEditFood = (food: FoodParams) => {
    setModalState({
      ...modalState,
      editingFood: food,
      editModalOpen: true,
    })
  }

  return (
    <>
      <Header openModal={toggleModal} />
      <ModalAddFood
        isOpen={modalState.modalOpen}
        setIsOpen={toggleModal}
        handleAddFood={handleAddFood}
      />
      <ModalEditFood
        isOpen={modalState.editModalOpen}
        setIsOpen={toggleEditModal}
        editingFood={modalState.editingFood}
        handleUpdateFood={handleUpdateFood}
      />
      <FoodsContainer data-testid="foods-list">
        {modalState.foods &&
          modalState.foods.map(food => (
            <Food
              key={food.id}
              food={food}
              handleDelete={handleDeleteFood}
              handleEditFood={handleEditFood}
            />
          ))}
      </FoodsContainer>
    </>
  );
};

export default Dashboard;
