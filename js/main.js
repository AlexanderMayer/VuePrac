let eventBus = new Vue()

Vue.component('product', {
    props: {
        premium: {
            type: Boolean, required: true
        },
    },
    template: `
   <div class="product">
	<div class="product-image">
            <img :src="image" :alt="altText"/>
        </div>

        <div class="product-info">
            <h1>{{ title }}</h1>
            <p>{{ description }}</p>
            <a :href="link">More products like this</a>
            <p v-if="inStock">In stock</p>
            <p v-else :class="{ outOfStock: !inStock }">Out of stock</p>
            <p v-show="sale">On sale</p>
            <div
                    class="color-box"
                    v-for="(variant, index) in variants"
                    :key="variant.variantId"
                    :style="{ backgroundColor:variant.variantColor }"
                    @mouseover="updateProduct(index)"
            >
            </div>

            <ul>
                <li v-for="size in sizes">{{ size }}</li>
            </ul>

            <button v-on:click="addToCart" :disabled="!inStock" :class="{ disabledButton: !inStock }">Add to cart
            </button>
            <button v-on:click="deleteFromCart" :disabled="!inStock" :class="{ disabledButton: !inStock }">Delete from
                cart
            </button>
            <product-tabs :reviews="reviews" :premium="premium"></product-tabs>
        </div>
   </div>
 `, data() {
        return {
            product: "Socks",
            brand: 'Vue Mastery',
            description: "A pair of warm, fuzzy socks",
            altText: "A pair of socks",
            link: "https://www.amazon.com/s/ref=nb_sb_noss?url=search-alias%3Daps&field-keywords=socks",
            variants: [{
                variantId: 2234,
                variantColor: 'green',
                variantImage: "./assets/vmSocks-green-onWhite.jpg",
                variantQuantity: 10,
                onSale: true
            }, {
                variantId: 2235,
                variantColor: 'blue',
                variantImage: "./assets/vmSocks-blue-onWhite.jpg",
                variantQuantity: 0,
                onSale: false
            }],
            sizes: ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
            selectedVariant: 0,
            reviews: [],
        }
    },

    methods: {
        addToCart() {
            this.$emit('add-to-cart', this.variants[this.selectedVariant].variantId);
        },

        deleteFromCart() {
            this.$emit('delete-product', this.variants[this.selectedVariant].variantId);
        },

        updateProduct(index) {
            this.selectedVariant = index;
            console.log(index);
        },


    }, computed: {
        title() {

            return this.brand + ' ' + this.product;
        },

        image() {
            return this.variants[this.selectedVariant].variantImage;
        },

        inStock() {
            return this.variants[this.selectedVariant].variantQuantity;
        },

        sale() {
            return this.variants[this.selectedVariant].onSale;
        },

    },
    mounted() {
        eventBus.$on('review-submitted', productReview => {
            this.reviews.push(productReview)
        })
    }
})

Vue.component('product-details', {
    template: `
        <ul>
            <li v-for="detail in details">{{ detail }}</li>
        </ul>            
 `,
    data() {
        return {
            details: ['80% cotton', '20% polyester', 'Gender-neutral']
        }
    }
})

Vue.component('product-review', {
    template: `
   <form class="review-form" @submit.prevent="onSubmit">
     <p v-if="errors.length">
     <b>Please correct the following error(s):</b>
     <ul>
       <li v-for="error in errors">{{ error }}</li>
     </ul>
     </p>
     <p>
       <label for="name">Name:</label>
       <input id="name" v-model="name" placeholder="name">
     </p>
    
     <p>
       <label for="review">Review:</label>
       <textarea id="review" v-model="review"></textarea>
     </p>
    
     <p>
       <label for="rating">Rating:</label>
       <select id="rating" v-model.number="rating">
         <option>5</option>
         <option>4</option>
         <option>3</option>
         <option>2</option>
         <option>1</option>
       </select>
     </p>

     <p>
        <p>Would you recommend this product?</p>
        <div class="radio-flex">
            <label for="recommendYes">Yes</label>
            <input class="radio" id="recommendYes" type="radio" name="recommend" value="Yes" v-model="recommend"> 
            <label for="recommendNo">No</label>
            <input class="radio" id="recommendNo" type="radio" name="recommend" value="No" v-model="recommend"> 
        </div>
     </p>
     
     <p>
       <input type="submit" value="Submit"> 
     </p>
   </form>
 `, data() {
        return {
            name: null,
            review: null,
            rating: null,
            recommend: null,
            errors: [],
            editFlag: false,
            editForName: null,
            editForReview: null,
            editForRating: null,
            editForRecommend: null,
            editForErrors: [],
        }
    },

    methods: {
        onSubmit() {
            if(this.name && this.review && this.rating && this.recommend && this.errors) {
                let productReview = {
                    name: this.name,
                    review: this.review,
                    rating: this.rating,
                    recommend: this.recommend,
                    editFlag: false,
                    editForName: this.name,
                    editForReview: this.review,
                    editForRating: this.rating,
                    editForRecommend: this.recommend,
                    editForErrors: [],
                }
                eventBus.$emit('review-submitted', productReview)
                this.name = null
                this.review = null
                this.rating = null
                this.recommend = null
                this.errors = []
            } else {
                if(!this.name) this.errors.push("Name required.")
                if(!this.review) this.errors.push("Review required.")
                if(!this.rating) this.errors.push("Rating required.")
                if(!this.recommend) this.errors.push("Recommend required.")
            }

        }
    }
})

Vue.component('product-tabs', {
    props: {
        reviews: {
            type: Array,
            required: false
        },
        premium: {
            type: Boolean, required: true
        },
    },

    template: `
    <div>   
       <ul>
         <span class="tab"
               :class="{ activeTab: selectedTab === tab }"
               v-for="(tab, index) in tabs"
               @click="selectedTab = tab"
         >{{ tab }}</span>
       </ul>
       <div v-show="selectedTab === 'Reviews'">
         <p v-if="!reviews.length">There are no reviews yet.</p>
         <ul>
           <li v-for="(review, index) in reviews">
           <p>{{ review.name }}</p>
           <p>Rating: {{ review.rating }}</p>
           <p>{{ review.review }}</p>
           <p>Recommend: {{ review.recommend }}</p>
           <button @click="editReviews(index)" v-show="review.rating < 4">edit</button>
           <div v-if="review.editFlag">
                <form class="review-form" @submit.prevent="onSubmit">
                    <p v-if="review.editForErrors.length">
                    <b>Please correct the following error(s):</b>
                    <ul>
                        <li v-for="error in review.editForErrors">{{ error }}</li>
                    </ul>
                    </p>
                    <p>
                        <label for="name">Name:</label>
                        <input id="name" v-model="review.editForName" placeholder="name">
                    </p>
                    
                    <p>
                        <label for="review">Review:</label>
                        <textarea id="review" v-model="review.editForReview"></textarea>
                    </p>
                    
                    <p>
                        <label for="review.editForRating">Rating:</label>
                        <select id="rating" v-model.number="review.editForRating">
                        <option>5</option>
                        <option>4</option>
                        <option>3</option>
                        <option>2</option>
                        <option>1</option>
                        </select>
                    </p>
                
                    <p>
                        <p>Would you recommend this product?</p>
                        <div class="radio-flex">
                            <label for="recommendYes">Yes</label>
                            <input class="radio" id="recommendYes" type="radio" name="recommend" value="Yes" v-model="review.editForRecommend"> 
                            <label for="recommendNo">No</label>
                            <input class="radio" id="recommendNo" type="radio" name="recommend" value="No" v-model="review.editForRecommend"> 
                        </div>
                    </p>
                    
                    <p>
                        <button @click.prevent="onSubmit(index)">edit</button>
                    </p>
                </form>
            </div>
           </li>
         </ul>
       </div>
       <div v-show="selectedTab === 'Make a Review'">
         <product-review></product-review>
       </div>
       <div v-show="selectedTab === 'Shipping'" @click.prevent="shippClick">
        <p>Shipping: {{ shipping }}</p>
       </div>
       <div v-show="selectedTab === 'Details'">
        <product-details></product-details>
       </div>
    </div>

 `,
    data() {
        return {
            tabs: ['Reviews', 'Make a Review', 'Shipping', 'Details'],
            selectedTab: 'Reviews'
        }
    },
    computed: {
        shipping() {

            if (this.premium) {
                return "Free";
            } else {
                return 2.99
            }
        }
    },
    methods: {
        editReviews(index) {
            let blank = this.reviews[index];
            blank.editFlag = true;
        },
        onSubmit(index) {
            if(this.reviews[index].editForName && this.reviews[index].editForReview && this.reviews[index].editForRating && this.reviews[index].editForRecommend && this.reviews[index].editForErrors) {
                this.reviews[index].name = this.reviews[index].editForName;
                this.reviews[index].review = this.reviews[index].editForReview;
                this.reviews[index].rating = this.reviews[index].editForRating;
                this.reviews[index].recommend = this.reviews[index].editForRecommend;
                this.reviews[index].editForErrors = []
                this.reviews[index].editFlag = false;
            } else {
                if(!this.reviews[index].editForName) this.reviews[index].editForErrors.push("Name required.")
                if(!this.reviews[index].editForReview) this.reviews[index].editForErrors.push("Review required.")
                if(!this.reviews[index].editForRating) this.reviews[index].editForErrors.push("Rating required.")
                if(!this.reviews[index].editForRecommend) this.reviews[index].editForErrors.push("Recommend required.")
            }

        }
    }
})

let app = new Vue({
    el: '#app', data: {
        premium: true,
        cart: [],
    },

    methods: {
        updateCart(id) {
            this.cart.push(id);
        },

        deleteProduct(id) {
            let index = this.cart.indexOf(id)
            this.cart.splice(index, 1);
        }
    },

    computed: {},

})
 