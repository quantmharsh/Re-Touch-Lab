import React from 'react'


//it is a dynamic routing page. because   we will render different images based on their [id] 
const TransformationsPage = ({params:{id}}:{params:{id:string}}) => {
  return (
    <div>
       Image Transformation page
    </div>
  )
}

export default TransformationsPage
