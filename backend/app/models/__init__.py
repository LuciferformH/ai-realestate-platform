from app.models.user import User
from app.models.property import Property
from app.models.city import City
from app.models.category import Category
from app.models.favorite import Favorite
from app.models.saved_search import SavedSearch
from app.models.price_alert import PriceAlert
from app.models.ml_model import MLModel

__all__ = [
    "User",
    "Property",
    "City",
    "Category",
    "Favorite",
    "SavedSearch",
    "PriceAlert",
    "MLModel",
]
