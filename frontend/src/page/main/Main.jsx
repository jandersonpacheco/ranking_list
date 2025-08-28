import style from './main.module.css'
import { useEffect, useRef, useState } from 'react'
import Modal from 'react-modal'
import { v4 as uuidv4 } from 'uuid'
import axios from 'axios'

Modal.setAppElement('#root')

const Main = () => {
    //Rankings state
    const [rankings, setRankings] = useState([])
    //Modal states
    const [newListModal, setNewListModal] = useState(false)
    const [selectedRankingModal, setSelectedRankingModal] = useState(false)
    const [itemModal, setItemModal] = useState(false)
    //Add New Rankings
    const [newTitle, setNewTitle] = useState('')
    const [newDescription, setNewDescription] = useState('')
    //Add New Items
    const [newItem, setNewItem] = useState('')
    const [newPosition, setNewPosition] = useState('')
    const [newDescriptionItem, setNewDescriptionItem] = useState('')
    const [newRating, setNewRating] = useState('')
    //Selected Ranking
    const [selectedRanking, setSelectedRanking] = useState(null)
    const editingItemRef = useRef(null)
    //API Data
    const [searchItems, setSearchItems] = useState([])
    const [loading, setLoading] = useState(true)


    //New Ranking Modal Function
    const newRanking = () => {
        setNewListModal(true)
    }
    const closeNewListModal = () => {
        setNewListModal(false)
    }
    const closeViewRankingModal = () => {
        setNewListModal(false)
        setSelectedRankingModal(false)
    }
    const closeItemModal = () => {
        setItemModal(false)
    }

    //Selected Ranking Modal Function
    const viewRanking = (id) => {
        const selectedRanking = rankings.find(ranking => ranking.id === id)

        if (!selectedRanking) return

        setSelectedRanking(selectedRanking)
        setSelectedRankingModal(true)
    }


    //Creating New Ranking
    const saveRanking = () => {
        const newRanking = {
            id: uuidv4(),
            newTitle,
            newDescription,
            items: []
        }
        setRankings(prevRankings => [...prevRankings, newRanking])

        setNewTitle('')
        setNewDescription('')
        setNewListModal(false)
    }

    //API Config
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIwYTEyMzQ3MTk5NGVmMGU4YzlkNmVhMjlhOWY3YTM5YiIsIm5iZiI6MTczNjczNDY2NS4wNiwic3ViIjoiNjc4NDc3YzkwNjkwYWMwNmU3N2I2YmJjIiwic2NvcGVzIjpbImFwaV9yZWFkIl0sInZlcnNpb24iOjF9.LPEqmskd9heCWoe_8TymhgsprUedEVuwEZrKVMhD1pw',
    }

    useEffect(() =>{
        if(newItem === '') return

        axios.get(`https://api.themoviedb.org/3/search/tv?query=${newItem}&include_adult=false&language=en-US&page=1`, {headers})
            .then((response) => {
                setSearchItems(response.data.results)
                setLoading(false)
            })
            .catch((error)=>{
                console.log('Erro ao carregar os dados!', error)
                setLoading(false)
            })
    }, [newItem])

    //Add API data to the list
    const choosedItem = (rankingId, itemId) => {
        setItemModal(true)



        const selectedRanking = rankings.find(ranking => ranking.id === rankingId)
        const selectedItem = searchItems.find(item => item.id === itemId)

        if(!selectedRanking || !selectedItem) return item
        
        const updatedItems = [...selectedRanking.items,{
            id: selectedItem.id,
            title: selectedItem.name,
            poster: selectedItem.poster_path,
        }]

        const updateRanking = {
            ...selectedRanking,
            items: updatedItems
        }

        setRankings(prevRankings => prevRankings.map(ranking =>
            ranking.id === rankingId ? updateRanking : ranking
        ))

        editingItemRef.current = itemId
        setSelectedRanking(updateRanking)
        setNewItem('')
        setSearchItems([])
    }

    //Save items Informations (rating, position and description)
    const itemsInformations = (rankingId) => {
        const selectedRanking = rankings.find(ranking => ranking.id === rankingId)

        if(!selectedRanking) return console.error('ID ou item não encontrado.')

        const updatedItemsInformations = selectedRanking.items.map(item => {
            if(item.id !== editingItemRef.current) return item

            return{
                ...item,
                position: newPosition,
                description: newDescriptionItem,
                rating: newRating
            }
        })

        const updatedRanking = {
            ...selectedRanking,
            items: updatedItemsInformations
        }

        updatedRanking.items.sort((a, b) => {
            return a.position - b.position
        })

        setRankings(prevRankings => prevRankings.map(ranking =>
            ranking.id === rankingId ? updatedRanking : ranking
        ))

        setSelectedRanking(updatedRanking)
        setNewDescriptionItem('')
        setNewPosition('')
        setNewRating('')
        setItemModal(false)
    }
    
    return (
        <>
            <div className={style.newRanking}>
                <button onClick={newRanking}>Criar Lista</button>
                <Modal
                    isOpen={newListModal}
                    onRequestClose={closeNewListModal}
                    contentLabel="Ranked List"
                >
                    <h2>Novo Ranking</h2>
                    <div>
                        <label htmlFor="title">Título: </label>
                        <input type="text" id="title" value={newTitle} onChange={(event) => setNewTitle(event.target.value)}/>
                        <label htmlFor="description">Descrição: </label>
                        <textarea id="description" value={newDescription} onChange={(event) => setNewDescription(event.target.value)}/>
                    </div>
                    <div>
                        <button onClick={closeNewListModal} type="submit">Cancelar</button>
                        <button onClick={saveRanking} type="submit">Criar Ranking</button>
                    </div>
                </Modal>
            </div>

            <div className={style.rankings}>
                {rankings.length > 0 ? (
                    <>
                        {rankings.map((ranking) => (
                            <button key={ranking.id} onClick={() => viewRanking(ranking.id)}>
                                {ranking.newTitle}
                            </button>
                        ))}
                        <Modal
                            isOpen={selectedRankingModal}
                            onRequestClose={closeViewRankingModal}
                            contentLabel="Ranked List"
                        >
                            {selectedRanking ? (
                                <>
                                <h2 className={style.rankingTitle}>{selectedRanking.newTitle}</h2>
                            <p className={style.rankingDescription}>{selectedRanking.newDescription}</p>
                            <div>
                                <label htmlFor="item">Item: </label>
                                <input type="text" id="item" value={newItem} onChange={(event) => setNewItem(event.target.value)}/>
                            </div>
                            <div className={style.viewingRanking}>
                                    {newItem === '' && selectedRanking.items && selectedRanking.items.length > 0 ? (
                                        selectedRanking.items.map((item) => (
                                            <div key={item.itemId}>
                                                <p className={style.title}>{item.position}º - {item.title}</p>
                                            <div className={style.itemContainer}>
                                                <img
                                                    className={style.picture}
                                                    src={`https://image.tmdb.org/t/p/w500${item.poster}`}
                                                    alt={item.name}
                                                />
                                                <div className={style.itemInformations}>
                                                    <p className={style.itemDescription}>{item.description}</p>
                                                    <p className={style.itemRating}>Nota: {item.rating}</p>
                                                </div>
                                            </div>
                                            </div>
                                        ))
                                    ):(
                                        <></>
                                    )}
                                    <ul>
                                    {searchItems.length > 0 && newItem !== '' ?(
                                        searchItems.map((searchItem) => (
                                            <li 
                                                key={searchItem.id}
                                                onClick={() => choosedItem(selectedRanking.id, searchItem.id)}
                                            >
                                                <img
                                                    className={style.picture}
                                                    src={`https://image.tmdb.org/t/p/w500${searchItem.poster_path}`}
                                                    alt={searchItem.name}
                                                />
                                                {searchItem.name}
                                            </li>
                                        ))
                                    ):(
                                        <></>
                                    )}
                                    </ul>
                        <Modal
                            isOpen={itemModal}
                            onRequestClose={closeItemModal}
                            contentLabel="Ranked List"
                        >
                            <label htmlFor='position'>Posição: </label>
                            <input id='position' type='number' value={newPosition} onChange={(event) => setNewPosition(event.target.value)}></input>
                            <label htmlFor='itemDescription'>Descrição: </label>
                            <input id='itemDescription' type='text' value={newDescriptionItem} onChange={(event) => setNewDescriptionItem(event.target.value) }></input>
                            <label htmlFor='rating'>Nota: </label>
                            <input id='rating' type='number' value={newRating} onChange={(event) => setNewRating(event.target.value) }></input>
                            <button id='saveItemInformations' onClick={() => itemsInformations(selectedRanking.id)}>Salvar</button>
                        </Modal>
                            </div>
                                </>
                            ):(
                                <></>
                            )}
                            
                        </Modal>
                    </>
                ) : (
                    <>
                        <p>Não há nenhum ranking criado.</p>
                    </>
                )}
            </div>
        </>
    )
}

export default Main
