"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  Database, 
  Key, 
  Mail, 
  Phone, 
  MapPin, 
  Building, 
  CreditCard, 
  Download, 
  Upload, 
  Trash2, 
  Save, 
  RefreshCw, 
  Eye, 
  EyeOff, 
  Check, 
  X, 
  AlertTriangle, 
  Info, 
  Moon, 
  Sun, 
  Monitor, 
  Smartphone, 
  Laptop, 
  Tablet, 
  Volume2, 
  VolumeX, 
  Wifi, 
  WifiOff, 
  Lock, 
  Unlock, 
  Camera, 
  Mic, 
  MicOff, 
  Calendar, 
  Clock, 
  Languages, 
  DollarSign, 
  Percent, 
  FileText, 
  Image, 
  Video, 
  Music, 
  Archive, 
  HardDrive, 
  Cloud, 
  Server, 
  Zap, 
  Activity, 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Target, 
  Users, 
  UserPlus, 
  UserMinus, 
  Crown, 
  Star, 
  Award, 
  Gift, 
  Heart, 
  ThumbsUp, 
  MessageSquare, 
  Share2, 
  Link, 
  QrCode, 
  Scan, 
  Filter, 
  Search, 
  SortAsc, 
  SortDesc, 
  Grid, 
  List, 
  Columns, 
  Rows, 
  Layout, 
  Sidebar, 
  Menu, 
  MoreHorizontal, 
  Plus, 
  Minus, 
  Edit, 
  Copy, 
  Cut, 
  Paste, 
  Undo, 
  Redo, 
  RotateCcw, 
  RotateCw, 
  FlipHorizontal, 
  FlipVertical, 
  ZoomIn, 
  ZoomOut, 
  Maximize, 
  Minimize, 
  Move, 
  Resize, 
  Crop, 
  Scissors, 
  Paintbrush, 
  Eraser, 
  Pipette, 
  Ruler, 
  Compass, 
  Triangle, 
  Square, 
  Circle, 
  Hexagon, 
  Pentagon, 
  Octagon, 
  Diamond, 
  Heart as HeartIcon, 
  Star as StarIcon, 
  Bookmark, 
  Flag, 
  Tag, 
  Hash, 
  AtSign, 
  Percent as PercentIcon, 
  DollarSign as DollarIcon, 
  Euro, 
  PoundSterling, 
  Yen, 
  Bitcoin, 
  Banknote, 
  Coins, 
  Wallet, 
  CreditCard as CreditCardIcon, 
  Receipt, 
  Calculator, 
  PiggyBank, 
  TrendingDown, 
  ArrowUp, 
  ArrowDown, 
  ArrowLeft, 
  ArrowRight, 
  ChevronUp, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight, 
  ChevronsUp, 
  ChevronsDown, 
  ChevronsLeft, 
  ChevronsRight, 
  CornerDownLeft, 
  CornerDownRight, 
  CornerUpLeft, 
  CornerUpRight, 
  CornerLeftDown, 
  CornerLeftUp, 
  CornerRightDown, 
  CornerRightUp, 
  MousePointer, 
  MousePointer2, 
  Hand, 
  Fingerprint, 
  Gamepad, 
  Gamepad2, 
  Joystick, 
  Keyboard, 
  Mouse, 
  Headphones, 
  Speaker, 
  Microphone, 
  Radio, 
  Tv, 
  Monitor as MonitorIcon, 
  Smartphone as SmartphoneIcon, 
  Tablet as TabletIcon, 
  Laptop as LaptopIcon, 
  Watch, 
  Camera as CameraIcon, 
  Video as VideoIcon, 
  Film, 
  Clapperboard, 
  PlayCircle, 
  PauseCircle, 
  StopCircle, 
  SkipBack, 
  SkipForward, 
  Rewind, 
  FastForward, 
  Play, 
  Pause, 
  Stop, 
  Record, 
  Shuffle, 
  Repeat, 
  Repeat1, 
  Volume, 
  Volume1, 
  VolumeX as VolumeXIcon, 
  Mute, 
  Unmute, 
  SpeakerLoud, 
  SpeakerQuiet, 
  Headset, 
  Earphones, 
  AirVent, 
  Fan, 
  Wind, 
  Thermometer, 
  Gauge, 
  Speedometer, 
  Timer, 
  Stopwatch, 
  AlarmClock, 
  Clock as ClockIcon, 
  Calendar as CalendarIcon, 
  CalendarDays, 
  CalendarCheck, 
  CalendarX, 
  CalendarPlus, 
  CalendarMinus, 
  CalendarRange, 
  CalendarSearch, 
  CalendarHeart, 
  CalendarClock, 
  Schedule, 
  Hourglass, 
  Sunrise, 
  Sunset, 
  Sun as SunIcon, 
  Moon as MoonIcon, 
  Stars, 
  CloudRain, 
  CloudSnow, 
  CloudLightning, 
  CloudDrizzle, 
  CloudHail, 
  Cloudy, 
  PartlyCloudy, 
  Rainbow, 
  Umbrella, 
  Zap as ZapIcon, 
  Bolt, 
  Flash, 
  Flame, 
  Snowflake, 
  Droplets, 
  Waves, 
  Mountain, 
  MountainSnow, 
  Trees, 
  TreePine, 
  TreeDeciduous, 
  Flower, 
  Flower2, 
  Leaf, 
  Seedling, 
  Sprout, 
  Cherry, 
  Apple, 
  Grape, 
  Banana, 
  Orange, 
  Lemon, 
  Strawberry, 
  Watermelon, 
  Carrot, 
  Corn, 
  Wheat, 
  Coffee, 
  Wine, 
  Beer, 
  Martini, 
  Soup, 
  Pizza, 
  Sandwich, 
  Cake, 
  Cookie, 
  IceCream, 
  Candy, 
  Lollipop, 
  Donut, 
  Croissant, 
  Bagel, 
  Pretzel, 
  Popcorn, 
  Nut, 
  Egg, 
  Milk, 
  Cheese, 
  Meat, 
  Fish, 
  Shrimp, 
  Crab, 
  Lobster, 
  Chicken, 
  Turkey, 
  Bacon, 
  Ham, 
  Sausage, 
  Steak, 
  Salad, 
  Broccoli, 
  Mushroom, 
  Onion, 
  Garlic, 
  Pepper, 
  Chili, 
  Tomato, 
  Potato, 
  Avocado, 
  Cucumber, 
  Lettuce, 
  Spinach, 
  Cabbage, 
  Celery, 
  Radish, 
  Turnip, 
  Beet, 
  Pumpkin, 
  Squash, 
  Eggplant, 
  Zucchini, 
  Artichoke, 
  Asparagus, 
  BeanSprout, 
  Pea, 
  Bean, 
  Lentil, 
  Rice, 
  Pasta, 
  Bread, 
  Baguette, 
  Croissant as CroissantIcon, 
  Muffin, 
  Pancakes, 
  Waffle, 
  Toast, 
  Cereal, 
  Oatmeal, 
  Yogurt, 
  Smoothie, 
  Juice, 
  Soda, 
  Water, 
  Tea, 
  Coffee as CoffeeIcon, 
  Espresso, 
  Cappuccino, 
  Latte, 
  Mocha, 
  HotChocolate, 
  Milkshake, 
  IcedTea, 
  Lemonade, 
  Cocktail, 
  Mocktail, 
  Champagne, 
  Wine as WineIcon, 
  Beer as BeerIcon, 
  Whiskey, 
  Vodka, 
  Rum, 
  Gin, 
  Tequila, 
  Brandy, 
  Sake, 
  Mead, 
  Cider, 
  Kombucha, 
  Kefir, 
  Kvass, 
  Ayran, 
  Lassi, 
  Chai, 
  Matcha, 
  Bubble, 
  Slush, 
  Granita, 
  Sorbet, 
  Gelato, 
  Frozen, 
  Popsicle, 
  Sundae, 
  Parfait, 
  Trifle, 
  Pudding, 
  Custard, 
  Mousse, 
  Souffle, 
  Flan, 
  Creme, 
  Tiramisu, 
  Cheesecake, 
  Pie, 
  Tart, 
  Pastry, 
  Eclair, 
  Profiterole, 
  Macaron, 
  Macaroon, 
  Brownie, 
  Blondie, 
  Bar, 
  Square, 
  Bite, 
  Truffle, 
  Bonbon, 
  Praline, 
  Nougat, 
  Caramel, 
  Toffee, 
  Butterscotch, 
  Fudge, 
  Taffy, 
  Gummy, 
  Jelly, 
  Gum, 
  Mint, 
  Lozenge, 
  Drop, 
  Stick, 
  Rock, 
  Cotton, 
  Floss, 
  Candy as CandyIcon, 
  Sweet, 
  Treat, 
  Dessert, 
  Snack, 
  Appetizer, 
  Entree, 
  Main, 
  Side, 
  Sauce, 
  Dressing, 
  Marinade, 
  Seasoning, 
  Spice, 
  Herb, 
  Salt, 
  Sugar, 
  Honey, 
  Syrup, 
  Jam, 
  Jelly as JellyIcon, 
  Preserve, 
  Marmalade, 
  Spread, 
  Butter, 
  Oil, 
  Vinegar, 
  Mustard, 
  Ketchup, 
  Mayo, 
  Ranch, 
  Caesar, 
  Italian, 
  French, 
  Thousand, 
  Blue, 
  Balsamic, 
  Olive, 
  Coconut, 
  Sesame, 
  Peanut, 
  Almond, 
  Walnut, 
  Pecan, 
  Cashew, 
  Pistachio, 
  Hazelnut, 
  Macadamia, 
  Brazil, 
  Pine, 
  Sunflower, 
  Pumpkin as PumpkinIcon, 
  Flax, 
  Chia, 
  Hemp, 
  Quinoa, 
  Amaranth, 
  Buckwheat, 
  Millet, 
  Barley, 
  Oats, 
  Rye, 
  Spelt, 
  Kamut, 
  Farro, 
  Bulgur, 
  Couscous, 
  Polenta, 
  Grits, 
  Hominy, 
  Masa, 
  Flour, 
  Cornmeal, 
  Semolina, 
  Bran, 
  Germ, 
  Endosperm, 
  Kernel, 
  Grain, 
  Cereal as CerealIcon, 
  Muesli, 
  Granola, 
  Porridge, 
  Gruel, 
  Congee, 
  Risotto, 
  Pilaf, 
  Paella, 
  Jambalaya, 
  Gumbo, 
  Chowder, 
  Bisque, 
  Gazpacho, 
  Minestrone, 
  Pho, 
  Ramen, 
  Udon, 
  Soba, 
  Pad, 
  Lo, 
  Chow, 
  Fried, 
  Steamed, 
  Boiled, 
  Baked, 
  Roasted, 
  Grilled, 
  Broiled, 
  Sauteed, 
  Stir, 
  Braised, 
  Stewed, 
  Poached, 
  Blanched, 
  Parboiled, 
  Simmered, 
  Slow, 
  Pressure, 
  Microwave, 
  Toaster, 
  Oven, 
  Stovetop, 
  Grill, 
  Barbecue, 
  Smoker, 
  Fryer, 
  Steamer, 
  Rice, 
  Cooker, 
  Blender, 
  Mixer, 
  Processor, 
  Juicer, 
  Grinder, 
  Mill, 
  Mortar, 
  Pestle, 
  Whisk, 
  Spatula, 
  Ladle, 
  Tongs, 
  Fork, 
  Knife, 
  Spoon, 
  Chopsticks, 
  Plate, 
  Bowl, 
  Cup, 
  Mug, 
  Glass, 
  Tumbler, 
  Goblet, 
  Chalice, 
  Flute, 
  Snifter, 
  Shot, 
  Jigger, 
  Shaker, 
  Strainer, 
  Muddler, 
  Stirrer, 
  Opener, 
  Corkscrew, 
  Bottle, 
  Can, 
  Jar, 
  Container, 
  Tupperware, 
  Wrap, 
  Foil, 
  Parchment, 
  Wax, 
  Plastic, 
  Paper, 
  Napkin, 
  Towel, 
  Cloth, 
  Apron, 
  Mitt, 
  Glove, 
  Hat, 
  Chef, 
  Cook, 
  Baker, 
  Pastry, 
  Sous, 
  Line, 
  Prep, 
  Dishwasher, 
  Server, 
  Waiter, 
  Waitress, 
  Bartender, 
  Barista, 
  Sommelier, 
  Host, 
  Hostess, 
  Manager, 
  Owner, 
  Customer, 
  Guest, 
  Diner, 
  Patron, 
  Client, 
  Visitor, 
  Tourist, 
  Local, 
  Regular, 
  VIP, 
  Member, 
  Subscriber, 
  Follower, 
  Fan, 
  Supporter, 
  Advocate, 
  Ambassador, 
  Influencer, 
  Celebrity, 
  Expert, 
  Professional, 
  Amateur, 
  Hobbyist, 
  Enthusiast, 
  Connoisseur, 
  Critic, 
  Reviewer, 
  Blogger, 
  Vlogger, 
  Podcaster, 
  Streamer, 
  Creator, 
  Producer, 
  Director, 
  Editor, 
  Writer, 
  Author, 
  Journalist, 
  Reporter, 
  Photographer, 
  Videographer, 
  Designer, 
  Artist, 
  Illustrator, 
  Animator, 
  Developer, 
  Programmer, 
  Engineer, 
  Architect, 
  Consultant, 
  Advisor, 
  Mentor, 
  Coach, 
  Trainer, 
  Teacher, 
  Instructor, 
  Professor, 
  Student, 
  Learner, 
  Apprentice, 
  Intern, 
  Assistant, 
  Helper, 
  Volunteer, 
  Employee, 
  Worker, 
  Staff, 
  Team, 
  Group, 
  Organization, 
  Company, 
  Business, 
  Enterprise, 
  Corporation, 
  Startup, 
  Agency, 
  Firm, 
  Studio, 
  Shop, 
  Store, 
  Market, 
  Mall, 
  Center, 
  Plaza, 
  Square, 
  Street, 
  Avenue, 
  Boulevard, 
  Road, 
  Lane, 
  Drive, 
  Way, 
  Path, 
  Trail, 
  Route, 
  Highway, 
  Freeway, 
  Interstate, 
  Bridge, 
  Tunnel, 
  Overpass, 
  Underpass, 
  Intersection, 
  Crosswalk, 
  Sidewalk, 
  Curb, 
  Gutter, 
  Drain, 
  Sewer, 
  Manhole, 
  Hydrant, 
  Pole, 
  Sign, 
  Signal, 
  Light, 
  Lamp, 
  Post, 
  Meter, 
  Parking, 
  Garage, 
  Lot, 
  Space, 
  Zone, 
  Area, 
  District, 
  Neighborhood, 
  Community, 
  Village, 
  Town, 
  City, 
  County, 
  State, 
  Province, 
  Region, 
  Country, 
  Nation, 
  Continent, 
  World, 
  Planet, 
  Earth, 
  Globe as GlobeIcon, 
  Map, 
  Atlas, 
  Compass as CompassIcon, 
  GPS, 
  Navigation, 
  Direction, 
  Location, 
  Position, 
  Coordinate, 
  Latitude, 
  Longitude, 
  Altitude, 
  Elevation, 
  Distance, 
  Radius, 
  Perimeter, 
  Area as AreaIcon, 
  Volume as VolumeIcon, 
  Capacity, 
  Size, 
  Dimension, 
  Length, 
  Width, 
  Height, 
  Depth, 
  Thickness, 
  Weight, 
  Mass, 
  Density, 
  Pressure, 
  Temperature, 
  Humidity, 
  Moisture, 
  Dryness, 
  Wetness, 
  Hardness, 
  Softness, 
  Roughness, 
  Smoothness, 
  Texture, 
  Color, 
  Hue, 
  Saturation, 
  Brightness, 
  Contrast, 
  Opacity, 
  Transparency, 
  Clarity, 
  Blur, 
  Focus, 
  Sharp, 
  Dull, 
  Bright, 
  Dark, 
  Light as LightIcon, 
  Shadow, 
  Reflection, 
  Refraction, 
  Diffraction, 
  Interference, 
  Polarization, 
  Spectrum, 
  Frequency, 
  Wavelength, 
  Amplitude, 
  Phase, 
  Period, 
  Cycle, 
  Oscillation, 
  Vibration, 
  Resonance, 
  Harmony, 
  Discord, 
  Melody, 
  Rhythm, 
  Beat, 
  Tempo, 
  Pitch, 
  Tone, 
  Note, 
  Chord, 
  Scale, 
  Key, 
  Mode, 
  Interval, 
  Octave, 
  Semitone, 
  Whole, 
  Half, 
  Quarter, 
  Eighth, 
  Sixteenth, 
  Thirty, 
  Sixty, 
  Rest, 
  Pause as PauseIcon, 
  Silence, 
  Noise, 
  Sound, 
  Audio, 
  Voice, 
  Speech, 
  Language, 
  Word, 
  Sentence, 
  Paragraph, 
  Page, 
  Chapter, 
  Book, 
  Novel, 
  Story, 
  Tale, 
  Narrative, 
  Plot, 
  Character, 
  Setting, 
  Theme, 
  Conflict, 
  Resolution, 
  Climax, 
  Anticlimax, 
  Twist, 
  Surprise, 
  Suspense, 
  Mystery, 
  Romance, 
  Comedy, 
  Tragedy, 
  Drama, 
  Action, 
  Adventure, 
  Fantasy, 
  Science, 
  Fiction, 
  Horror, 
  Thriller, 
  Crime, 
  Detective, 
  Western, 
  Historical, 
  Biography, 
  Autobiography, 
  Memoir, 
  Essay, 
  Article, 
  Report, 
  Review, 
  Critique, 
  Analysis, 
  Summary, 
  Abstract, 
  Introduction, 
  Conclusion, 
  Reference, 
  Citation, 
  Bibliography, 
  Index, 
  Glossary, 
  Appendix, 
  Footnote, 
  Endnote, 
  Margin, 
  Header, 
  Footer, 
  Title, 
  Subtitle, 
  Heading, 
  Subheading, 
  Caption, 
  Label as LabelIcon, 
  Tag as TagIcon, 
  Category, 
  Genre, 
  Type, 
  Kind, 
  Sort, 
  Class, 
  Group as GroupIcon, 
  Set, 
  Collection, 
  Series, 
  Sequence, 
  Order, 
  Rank, 
  Level, 
  Grade, 
  Score, 
  Point, 
  Mark, 
  Rating, 
  Review as ReviewIcon, 
  Feedback, 
  Comment, 
  Opinion, 
  Thought, 
  Idea, 
  Concept, 
  Theory, 
  Hypothesis, 
  Assumption, 
  Belief, 
  Faith, 
  Trust, 
  Confidence, 
  Doubt, 
  Uncertainty, 
  Certainty, 
  Knowledge, 
  Wisdom, 
  Intelligence, 
  Understanding, 
  Comprehension, 
  Awareness, 
  Consciousness, 
  Perception, 
  Sensation, 
  Feeling, 
  Emotion, 
  Mood, 
  Attitude, 
  Behavior, 
  Action, 
  Reaction, 
  Response, 
  Stimulus, 
  Trigger, 
  Cause, 
  Effect, 
  Result, 
  Outcome, 
  Consequence, 
  Impact, 
  Influence, 
  Power, 
  Force, 
  Energy, 
  Strength, 
  Weakness, 
  Advantage, 
  Disadvantage, 
  Benefit, 
  Cost, 
  Price, 
  Value, 
  Worth, 
  Quality, 
  Quantity, 
  Amount, 
  Number, 
  Count, 
  Total, 
  Sum, 
  Average, 
  Mean, 
  Median, 
  Mode, 
  Range, 
  Variance, 
  Deviation, 
  Standard, 
  Normal, 
  Abnormal, 
  Unusual, 
  Common, 
  Rare, 
  Unique, 
  Special, 
  Ordinary, 
  Regular, 
  Irregular, 
  Consistent, 
  Inconsistent, 
  Stable, 
  Unstable, 
  Steady, 
  Unsteady, 
  Constant, 
  Variable, 
  Fixed, 
  Flexible, 
  Rigid, 
  Soft, 
  Hard, 
  Easy, 
  Difficult, 
  Simple, 
  Complex, 
  Complicated, 
  Confusing, 
  Clear, 
  Unclear, 
  Obvious, 
  Hidden, 
  Visible, 
  Invisible, 
  Apparent, 
  Subtle, 
  Direct, 
  Indirect, 
  Straight, 
  Curved, 
  Bent, 
  Twisted, 
  Turned, 
  Rotated, 
  Flipped, 
  Reversed, 
  Inverted, 
  Upside, 
  Down, 
  Up, 
  Left, 
  Right, 
  Forward, 
  Backward, 
  Inside, 
  Outside, 
  Above, 
  Below, 
  Over, 
  Under, 
  Through, 
  Around, 
  Across, 
  Along, 
  Between, 
  Among, 
  Within, 
  Without, 
  Before, 
  After, 
  During, 
  While, 
  Until, 
  Since, 
  From, 
  To, 
  At, 
  In, 
  On, 
  Off, 
  Out, 
  Into, 
  Onto, 
  Upon, 
  Against, 
  Toward, 
  Away, 
  Near, 
  Far, 
  Close, 
  Distant, 
  Here, 
  There, 
  Everywhere, 
  Nowhere, 
  Somewhere, 
  Anywhere, 
  Always, 
  Never, 
  Sometimes, 
  Often, 
  Rarely, 
  Seldom, 
  Frequently, 
  Occasionally, 
  Usually, 
  Normally, 
  Typically, 
  Generally, 
  Specifically, 
  Particularly, 
  Especially, 
  Mainly, 
  Mostly, 
  Partly, 
  Completely, 
  Entirely, 
  Fully, 
  Partially, 
  Somewhat, 
  Rather, 
  Quite, 
  Very, 
  Extremely, 
  Highly, 
  Greatly, 
  Significantly, 
  Considerably, 
  Substantially, 
  Moderately, 
  Slightly, 
  Barely, 
  Hardly, 
  Scarcely, 
  Almost, 
  Nearly, 
  Approximately, 
  Roughly, 
  About, 
  Around as AroundIcon, 
  Exactly, 
  Precisely, 
  Accurately, 
  Correctly, 
  Properly, 
  Appropriately, 
  Suitably, 
  Adequately, 
  Sufficiently, 
  Enough, 
  Too, 
  Much, 
  Many, 
  Few, 
  Little, 
  Less, 
  More, 
  Most, 
  Least, 
  Best, 
  Worst, 
  Better, 
  Worse, 
  Good, 
  Bad, 
  Great, 
  Terrible, 
  Excellent, 
  Poor, 
  Outstanding, 
  Awful, 
  Amazing, 
  Horrible, 
  Wonderful, 
  Dreadful, 
  Fantastic, 
  Awful as AwfulIcon, 
  Incredible, 
  Unbelievable, 
  Remarkable, 
  Extraordinary, 
  Ordinary as OrdinaryIcon, 
  Exceptional, 
  Typical, 
  Unusual as UnusualIcon, 
  Strange, 
  Weird, 
  Odd, 
  Even, 
  Smooth as SmoothIcon, 
  Rough, 
  Bumpy, 
  Flat, 
  Round, 
  Square as SquareIcon, 
  Rectangular, 
  Circular, 
  Triangular, 
  Oval, 
  Elliptical, 
  Spherical, 
  Cylindrical, 
  Conical, 
  Pyramidal, 
  Cubic, 
  Linear, 
  Angular, 
  Curved as CurvedIcon, 
  Straight as StraightIcon, 
  Diagonal, 
  Horizontal, 
  Vertical, 
  Parallel, 
  Perpendicular, 
  Intersecting, 
  Overlapping, 
  Separate, 
  Connected, 
  Disconnected, 
  Linked, 
  Unlinked, 
  Attached, 
  Detached, 
  Joined, 
  Split, 
  United, 
  Divided, 
  Combined, 
  Separated, 
  Merged, 
  Isolated, 
  Integrated, 
  Coordinated, 
  Synchronized, 
  Aligned, 
  Misaligned, 
  Balanced, 
  Unbalanced, 
  Centered, 
  Offset, 
  Symmetrical, 
  Asymmetrical, 
  Proportional, 
  Disproportional, 
  Scaled, 
  Unscaled, 
  Resized, 
  Stretched, 
  Compressed, 
  Expanded, 
  Contracted, 
  Enlarged, 
  Reduced, 
  Magnified, 
  Minimized, 
  Maximized, 
  Optimized, 
  Enhanced, 
  Improved, 
  Upgraded, 
  Downgraded, 
  Updated, 
  Outdated, 
  Current, 
  Latest, 
  Newest, 
  Oldest, 
  Recent, 
  Past, 
  Present, 
  Future, 
  Now, 
  Then, 
  Soon, 
  Later, 
  Earlier, 
  Previously, 
  Subsequently, 
  Eventually, 
  Finally, 
  Initially, 
  Originally, 
  Ultimately, 
  Temporarily, 
  Permanently, 
  Briefly, 
  Momentarily, 
  Instantly, 
  Immediately, 
  Quickly, 
  Slowly, 
  Fast, 
  Slow, 
  Rapid, 
  Gradual, 
  Sudden, 
  Smooth as SmoothIcon2, 
  Abrupt, 
  Gentle, 
  Harsh, 
  Mild, 
  Severe, 
  Intense, 
  Weak, 
  Strong as StrongIcon, 
  Powerful, 
  Powerless, 
  Effective, 
  Ineffective, 
  Efficient, 
  Inefficient, 
  Productive, 
  Unproductive, 
  Useful, 
  Useless, 
  Helpful, 
  Unhelpful, 
  Beneficial, 
  Harmful, 
  Positive, 
  Negative, 
  Constructive, 
  Destructive, 
  Creative, 
  Uncreative, 
  Innovative, 
  Traditional, 
  Modern, 
  Ancient, 
  Old, 
  New, 
  Fresh, 
  Stale, 
  Clean, 
  Dirty, 
  Pure, 
  Impure, 
  Clear as ClearIcon, 
  Cloudy as CloudyIcon, 
  Transparent as TransparentIcon, 
  Opaque, 
  Visible as VisibleIcon, 
  Hidden as HiddenIcon, 
  Open, 
  Closed, 
  Locked as LockedIcon, 
  Unlocked as UnlockedIcon, 
  Secure, 
  Insecure, 
  Safe, 
  Unsafe, 
  Protected, 
  Unprotected, 
  Guarded, 
  Unguarded, 
  Private, 
  Public, 
  Personal, 
  Professional as ProfessionalIcon, 
  Formal, 
  Informal, 
  Official, 
  Unofficial, 
  Legal, 
  Illegal, 
  Valid, 
  Invalid, 
  Legitimate, 
  Illegitimate, 
  Authorized, 
  Unauthorized, 
  Approved, 
  Disapproved, 
  Accepted, 
  Rejected, 
  Confirmed, 
  Unconfirmed, 
  Verified, 
  Unverified, 
  Authenticated, 
  Unauthenticated, 
  Certified, 
  Uncertified, 
  Licensed, 
  Unlicensed, 
  Registered, 
  Unregistered, 
  Enrolled, 
  Unenrolled, 
  Subscribed, 
  Unsubscribed, 
  Active, 
  Inactive, 
  Enabled, 
  Disabled, 
  Available, 
  Unavailable, 
  Online, 
  Offline, 
  Connected as ConnectedIcon, 
  Disconnected as DisconnectedIcon, 
  Linked as LinkedIcon, 
  Unlinked as UnlinkedIcon, 
  Synchronized as SynchronizedIcon, 
  Unsynchronized, 
  Updated as UpdatedIcon, 
  Outdated as OutdatedIcon, 
  Current as CurrentIcon, 
  Expired, 
  Valid as ValidIcon, 
  Invalid as InvalidIcon, 
  Working, 
  Broken, 
  Functional, 
  Dysfunctional, 
  Operational, 
  Nonoperational, 
  Running, 
  Stopped, 
  Started, 
  Finished, 
  Completed, 
  Incomplete, 
  Done, 
  Undone, 
  Successful, 
  Unsuccessful, 
  Failed, 
  Passed, 
  Pending, 
  Processing, 
  Waiting, 
  Ready, 
  Busy, 
  Idle, 
  Loading, 
  Loaded, 
  Saving, 
  Saved, 
  Sending, 
  Sent, 
  Receiving, 
  Received, 
  Downloading, 
  Downloaded, 
  Uploading, 
  Uploaded, 
  Installing, 
  Installed, 
  Uninstalling, 
  Uninstalled, 
  Updating as UpdatingIcon, 
  Updated as Updated2Icon, 
  Upgrading, 
  Upgraded as UpgradedIcon, 
  Downgrading, 
  Downgraded, 
  Configuring, 
  Configured, 
  Setting, 
  Set, 
  Resetting, 
  Reset, 
  Initializing, 
  Initialized, 
  Launching, 
  Launched, 
  Starting, 
  Started as StartedIcon, 
  Stopping, 
  Stopped as StoppedIcon, 
  Pausing, 
  Paused, 
  Resuming, 
  Resumed, 
  Restarting, 
  Restarted, 
  Refreshing, 
  Refreshed, 
  Reloading, 
  Reloaded, 
  Syncing, 
  Synced, 
  Backing, 
  Backed, 
  Restoring, 
  Restored, 
  Archiving, 
  Archived, 
  Deleting, 
  Deleted, 
  Removing, 
  Removed, 
  Adding, 
  Added, 
  Creating, 
  Created, 
  Building, 
  Built, 
  Compiling, 
  Compiled, 
  Deploying, 
  Deployed, 
  Publishing, 
  Published, 
  Sharing, 
  Shared, 
  Copying, 
  Copied, 
  Moving, 
  Moved, 
  Transferring, 
  Transferred, 
  Importing, 
  Imported, 
  Exporting, 
  Exported, 
  Converting, 
  Converted, 
  Transforming, 
  Transformed, 
  Processing as ProcessingIcon, 
  Processed, 
  Analyzing, 
  Analyzed, 
  Calculating, 
  Calculated, 
  Computing, 
  Computed, 
  Generating, 
  Generated, 
  Rendering, 
  Rendered, 
  Drawing, 
  Drawn, 
  Painting, 
  Painted, 
  Designing, 
  Designed, 
  Modeling, 
  Modeled, 
  Simulating, 
  Simulated, 
  Testing, 
  Tested, 
  Debugging, 
  Debugged, 
  Optimizing, 
  Optimized as OptimizedIcon, 
  Enhancing, 
  Enhanced as EnhancedIcon, 
  Improving, 
  Improved as ImprovedIcon, 
  Fixing, 
  Fixed, 
  Repairing, 
  Repaired, 
  Maintaining, 
  Maintained, 
  Cleaning, 
  Cleaned, 
  Organizing, 
  Organized, 
  Sorting, 
  Sorted, 
  Filtering, 
  Filtered, 
  Searching, 
  Searched, 
  Finding, 
  Found, 
  Looking, 
  Looked, 
  Viewing, 
  Viewed, 
  Watching, 
  Watched, 
  Observing, 
  Observed, 
  Monitoring, 
  Monitored, 
  Tracking, 
  Tracked, 
  Following, 
  Followed, 
  Leading, 
  Led, 
  Guiding, 
  Guided, 
  Directing, 
  Directed, 
  Managing, 
  Managed, 
  Controlling, 
  Controlled, 
  Operating, 
  Operated, 
  Handling, 
  Handled, 
  Using, 
  Used, 
  Applying, 
  Applied, 
  Implementing, 
  Implemented, 
  Executing, 
  Executed, 
  Performing, 
  Performed, 
  Completing, 
  Completed as CompletedIcon, 
  Achieving, 
  Achieved, 
  Accomplishing, 
  Accomplished, 
  Succeeding, 
  Succeeded, 
  Winning, 
  Won, 
  Losing, 
  Lost, 
  Failing, 
  Failed as FailedIcon, 
  Trying, 
  Tried, 
  Attempting, 
  Attempted, 
  Experimenting, 
  Experimented, 
  Exploring, 
  Explored, 
  Discovering, 
  Discovered, 
  Learning, 
  Learned, 
  Teaching, 
  Taught, 
  Training, 
  Trained, 
  Practicing, 
  Practiced, 
  Studying, 
  Studied, 
  Reading, 
  Read, 
  Writing, 
  Written, 
  Typing, 
  Typed, 
  Speaking, 
  Spoken, 
  Listening, 
  Heard, 
  Seeing, 
  Seen, 
  Feeling, 
  Felt, 
  Touching, 
  Touched, 
  Smelling, 
  Smelled, 
  Tasting, 
  Tasted, 
  Thinking, 
  Thought, 
  Remembering, 
  Remembered, 
  Forgetting, 
  Forgotten, 
  Knowing, 
  Known, 
  Understanding as UnderstandingIcon, 
  Understood, 
  Believing, 
  Believed, 
  Trusting, 
  Trusted, 
  Hoping, 
  Hoped, 
  Wishing, 
  Wished, 
  Wanting, 
  Wanted, 
  Needing, 
  Needed, 
  Requiring, 
  Required, 
  Demanding, 
  Demanded, 
  Requesting, 
  Requested, 
  Asking, 
  Asked, 
  Answering, 
  Answered, 
  Responding, 
  Responded, 
  Replying, 
  Replied, 
  Communicating, 
  Communicated, 
  Talking, 
  Talked, 
  Discussing, 
  Discussed, 
  Debating, 
  Debated, 
  Arguing, 
  Argued, 
  Agreeing, 
  Agreed, 
  Disagreeing, 
  Disagreed, 
  Accepting, 
  Accepted as AcceptedIcon, 
  Rejecting, 
  Rejected as RejectedIcon, 
  Approving, 
  Approved as ApprovedIcon, 
  Disapproving, 
  Disapproved as DisapprovedIcon, 
  Supporting, 
  Supported, 
  Opposing, 
  Opposed, 
  Helping, 
  Helped, 
  Assisting, 
  Assisted, 
  Serving, 
  Served, 
  Providing, 
  Provided, 
  Offering, 
  Offered, 
  Giving, 
  Given, 
  Taking, 
  Taken, 
  Receiving as ReceivingIcon, 
  Received as ReceivedIcon, 
  Getting, 
  Got, 
  Obtaining, 
  Obtained, 
  Acquiring, 
  Acquired, 
  Gaining, 
  Gained, 
  Earning, 
  Earned, 
  Making, 
  Made, 
  Producing, 
  Produced, 
  Creating as CreatingIcon, 
  Created as CreatedIcon, 
  Building as BuildingIcon, 
  Built as BuiltIcon, 
  Constructing, 
  Constructed, 
  Developing, 
  Developed, 
  Growing, 
  Grown, 
  Expanding, 
  Expanded as ExpandedIcon, 
  Increasing, 
  Increased, 
  Decreasing, 
  Decreased, 
  Reducing, 
  Reduced as ReducedIcon, 
  Shrinking, 
  Shrunk, 
  Contracting, 
  Contracted as ContractedIcon, 
  Compressing, 
  Compressed as CompressedIcon, 
  Stretching, 
  Stretched, 
  Extending, 
  Extended, 
  Lengthening, 
  Lengthened, 
  Shortening, 
  Shortened, 
  Widening, 
  Widened, 
  Narrowing, 
  Narrowed, 
  Thickening, 
  Thickened, 
  Thinning, 
  Thinned, 
  Deepening, 
  Deepened, 
  Shallowing, 
  Shallowed, 
  Raising, 
  Raised, 
  Lowering, 
  Lowered, 
  Lifting, 
  Lifted, 
  Dropping, 
  Dropped, 
  Falling, 
  Fallen, 
  Rising, 
  Risen, 
  Climbing, 
  Climbed, 
  Descending, 
  Descended, 
  Ascending, 
  Ascended, 
  Moving as MovingIcon, 
  Moved as MovedIcon, 
  Traveling, 
  Traveled, 
  Journeying, 
  Journeyed, 
  Going, 
  Gone, 
  Coming, 
  Came, 
  Arriving, 
  Arrived, 
  Departing, 
  Departed, 
  Leaving, 
  Left, 
  Staying, 
  Stayed, 
  Remaining, 
  Remained, 
  Continuing, 
  Continued, 
  Stopping as StoppingIcon, 
  Stopped as Stopped2Icon, 
  Pausing as PausingIcon, 
  Paused as PausedIcon, 
  Waiting as WaitingIcon, 
  Waited, 
  Resting, 
  Rested, 
  Sleeping, 
  Slept, 
  Waking, 
  Woke, 
  Getting as GettingIcon, 
  Got as GotIcon, 
  Standing, 
  Stood, 
  Sitting, 
  Sat, 
  Lying, 
  Lay, 
  Walking, 
  Walked, 
  Running as RunningIcon, 
  Ran, 
  Jumping, 
  Jumped, 
  Flying, 
  Flew, 
  Swimming, 
  Swam, 
  Driving, 
  Drove, 
  Riding, 
  Rode, 
  Cycling, 
  Cycled, 
  Skating, 
  Skated, 
  Skiing, 
  Skied, 
  Surfing, 
  Surfed, 
  Sailing, 
  Sailed, 
  Rowing, 
  Rowed, 
  Paddling, 
  Paddled, 
  Climbing as ClimbingIcon, 
  Climbed as ClimbedIcon, 
  Hiking, 
  Hiked, 
  Camping, 
  Camped, 
  Fishing, 
  Fished, 
  Hunting, 
  Hunted, 
  Gardening, 
  Gardened, 
  Cooking as CookingIcon, 
  Cooked, 
  Baking, 
  Baked, 
  Eating, 
  Ate, 
  Drinking, 
  Drank, 
  Playing, 
  Played, 
  Gaming, 
  Gamed, 
  Watching as WatchingIcon, 
  Watched as WatchedIcon, 
  Listening as ListeningIcon, 
  Listened, 
  Reading as ReadingIcon, 
  Read as ReadIcon, 
  Writing as WritingIcon, 
  Wrote, 
  Drawing as DrawingIcon, 
  Drew, 
  Painting as PaintingIcon, 
  Painted as PaintedIcon, 
  Singing, 
  Sang, 
  Dancing, 
  Danced, 
  Acting, 
  Acted, 
  Performing as PerformingIcon, 
  Performed as PerformedIcon, 
  Entertaining, 
  Entertained, 
  Laughing, 
  Laughed, 
  Crying, 
  Cried, 
  Smiling, 
  Smiled, 
  Frowning, 
  Frowned, 
  Celebrating, 
  Celebrated, 
  Partying, 
  Partied, 
  Meeting, 
  Met, 
  Greeting, 
  Greeted, 
  Welcoming, 
  Welcomed, 
  Visiting, 
  Visited, 
  Hosting, 
  Hosted, 
  Inviting, 
  Invited, 
  Attending, 
  Attended, 
  Participating, 
  Participated, 
  Joining, 
  Joined, 
  Leaving as LeavingIcon, 
  Left as LeftIcon, 
  Staying as StayingIcon, 
  Stayed as StayedIcon, 
  Living, 
  Lived, 
  Working as WorkingIcon, 
  Worked, 
  Studying as StudyingIcon, 
  Studied as StudiedIcon, 
  Learning as LearningIcon, 
  Learned as LearnedIcon, 
  Teaching as TeachingIcon, 
  Taught as TaughtIcon, 
  Training as TrainingIcon, 
  Trained as TrainedIcon, 
  Practicing as PracticingIcon, 
  Practiced as PracticedIcon, 
  Exercising, 
  Exercised, 
  Stretching as StretchingIcon, 
  Stretched as StretchedIcon, 
  Relaxing, 
  Relaxed, 
  Meditating, 
  Meditated, 
  Praying, 
  Prayed, 
  Worshipping, 
  Worshipped, 
  Believing as BelievingIcon, 
  Believed as BelievedIcon, 
  Hoping as HopingIcon, 
  Hoped as HopedIcon, 
  Dreaming, 
  Dreamed, 
  Imagining, 
  Imagined, 
  Thinking as ThinkingIcon, 
  Thought as ThoughtIcon, 
  Planning, 
  Planned, 
  Organizing as OrganizingIcon, 
  Organized as OrganizedIcon, 
  Preparing, 
  Prepared, 
  Arranging, 
  Arranged, 
  Scheduling, 
  Scheduled, 
  Booking, 
  Booked, 
  Reserving, 
  Reserved, 
  Ordering, 
  Ordered, 
  Purchasing, 
  Purchased, 
  Buying, 
  Bought, 
  Selling, 
  Sold, 
  Trading, 
  Traded, 
  Exchanging, 
  Exchanged, 
  Investing, 
  Invested, 
  Saving as SavingIcon, 
  Saved as SavedIcon, 
  Spending, 
  Spent, 
  Paying, 
  Paid, 
  Earning as EarningIcon, 
  Earned as EarnedIcon, 
  Working as Working2Icon, 
  Worked as Worked2Icon, 
  Employing, 
  Employed, 
  Hiring, 
  Hired, 
  Firing, 
  Fired, 
  Quitting, 
  Quit, 
  Retiring, 
  Retired, 
  Volunteering, 
  Volunteered, 
  Donating, 
  Donated, 
  Giving as GivingIcon, 
  Given as GivenIcon, 
  Sharing as SharingIcon, 
  Shared as SharedIcon, 
  Caring, 
  Cared, 
  Loving, 
  Loved, 
  Liking, 
  Liked, 
  Hating, 
  Hated, 
  Disliking, 
  Disliked, 
  Enjoying, 
  Enjoyed, 
  Suffering, 
  Suffered, 
  Hurting, 
  Hurt, 
  Healing, 
  Healed, 
  Helping as HelpingIcon, 
  Helped as HelpedIcon, 
  Supporting as SupportingIcon, 
  Supported as SupportedIcon, 
  Encouraging, 
  Encouraged, 
  Motivating, 
  Motivated, 
  Inspiring, 
  Inspired, 
  Leading as LeadingIcon, 
  Led as LedIcon, 
  Following as FollowingIcon, 
  Followed as FollowedIcon, 
  Guiding as GuidingIcon, 
  Guided as GuidedIcon, 
  Directing as DirectingIcon, 
  Directed as DirectedIcon, 
  Managing as ManagingIcon, 
  Managed as ManagedIcon, 
  Supervising, 
  Supervised, 
  Overseeing, 
  Oversaw, 
  Monitoring as MonitoringIcon, 
  Monitored as MonitoredIcon, 
  Controlling as ControllingIcon, 
  Controlled as ControlledIcon, 
  Regulating, 
  Regulated, 
  Governing, 
  Governed, 
  Ruling, 
  Ruled, 
  Commanding, 
  Commanded, 
  Ordering as OrderingIcon, 
  Ordered as OrderedIcon, 
  Instructing, 
  Instructed, 
  Advising, 
  Advised, 
  Consulting, 
  Consulted, 
  Recommending, 
  Recommended, 
  Suggesting, 
  Suggested, 
  Proposing, 
  Proposed, 
  Offering as OfferingIcon, 
  Offered as OfferedIcon, 
  Providing as ProvidingIcon, 
  Provided as ProvidedIcon, 
  Supplying, 
  Supplied, 
  Delivering, 
  Delivered, 
  Shipping, 
  Shipped, 
  Sending as SendingIcon, 
  Sent as SentIcon, 
  Receiving as Receiving2Icon, 
  Received as Received2Icon, 
  Getting as Getting2Icon, 
  Got as Got2Icon, 
  Taking as TakingIcon, 
  Taken as TakenIcon, 
  Grabbing, 
  Grabbed, 
  Holding, 
  Held, 
  Carrying, 
  Carried, 
  Lifting as LiftingIcon, 
  Lifted as LiftedIcon, 
  Pulling, 
  Pulled, 
  Pushing, 
  Pushed, 
  Dragging, 
  Dragged, 
  Dropping as DroppingIcon, 
  Dropped as DroppedIcon, 
  Placing, 
  Placed, 
  Putting, 
  Put, 
  Setting as SettingIcon, 
  Set as SetIcon, 
  Installing as InstallingIcon, 
  Installed as InstalledIcon, 
  Mounting, 
  Mounted, 
  Attaching, 
  Attached, 
  Connecting as ConnectingIcon, 
  Connected as Connected2Icon, 
  Linking as LinkingIcon, 
  Linked as Linked2Icon, 
  Joining as JoiningIcon, 
  Joined as JoinedIcon, 
  Combining, 
  Combined, 
  Merging, 
  Merged, 
  Mixing, 
  Mixed, 
  Blending, 
  Blended, 
  Integrating, 
  Integrated, 
  Incorporating, 
  Incorporated, 
  Including, 
  Included, 
  Adding as AddingIcon, 
  Added as AddedIcon, 
  Inserting, 
  Inserted, 
  Appending, 
  Appended, 
  Prepending, 
  Prepended, 
  Extending as ExtendingIcon, 
  Extended as ExtendedIcon, 
  Expanding as ExpandingIcon, 
  Expanded as Expanded2Icon, 
  Growing as GrowingIcon, 
  Grown as GrownIcon, 
  Increasing as IncreasingIcon, 
  Increased as IncreasedIcon, 
  Multiplying, 
  Multiplied, 
  Doubling, 
  Doubled, 
  Tripling, 
  Tripled, 
  Quadrupling, 
  Quadrupled, 
  Halving, 
  Halved, 
  Dividing, 
  Divided, 
  Splitting, 
  Split as SplitIcon, 
  Separating, 
  Separated, 
  Isolating, 
  Isolated, 
  Removing as RemovingIcon, 
  Removed as RemovedIcon, 
  Deleting as DeletingIcon, 
  Deleted as DeletedIcon, 
  Erasing, 
  Erased, 
  Clearing, 
  Cleared, 
  Cleaning as CleaningIcon, 
  Cleaned as CleanedIcon, 
  Washing, 
  Washed, 
  Wiping, 
  Wiped, 
  Polishing, 
  Polished, 
  Shining, 
  Shone, 
  Brightening, 
  Brightened, 
  Darkening, 
  Darkened, 
  Lightening, 
  Lightened, 
  Coloring, 
  Colored, 
  Painting as Painting2Icon, 
  Painted as Painted2Icon, 
  Drawing as Drawing2Icon, 
  Drew as DrewIcon, 
  Sketching, 
  Sketched, 
  Designing as DesigningIcon, 
  Designed as DesignedIcon, 
  Creating as Creating2Icon, 
  Created as Created2Icon, 
  Making as MakingIcon, 
  Made as MadeIcon, 
  Building as Building2Icon, 
  Built as Built2Icon, 
  Constructing as ConstructingIcon, 
  Constructed as ConstructedIcon, 
  Assembling, 
  Assembled, 
  Manufacturing, 
  Manufactured, 
  Producing as ProducingIcon, 
  Produced as ProducedIcon, 
  Generating as GeneratingIcon, 
  Generated as GeneratedIcon, 
  Developing as DevelopingIcon, 
  Developed as DevelopedIcon, 
  Programming, 
  Programmed, 
  Coding, 
  Coded, 
  Scripting, 
  Scripted, 
  Writing as Writing2Icon, 
  Written as WrittenIcon, 
  Typing as TypingIcon, 
  Typed as TypedIcon, 
  Entering, 
  Entered, 
  Inputting, 
  Input, 
  Outputting, 
  Output, 
  Printing, 
  Printed, 
  Scanning, 
  Scanned, 
  Copying as CopyingIcon, 
  Copied as CopiedIcon, 
  Pasting, 
  Pasted, 
  Cutting, 
  Cut as CutIcon, 
  Selecting, 
  Selected, 
  Choosing, 
  Chosen, 
  Picking, 
  Picked, 
  Deciding, 
  Decided, 
  Determining, 
  Determined, 
  Resolving, 
  Resolved, 
  Solving, 
  Solved, 
  Fixing as FixingIcon, 
  Fixed as FixedIcon, 
  Repairing as RepairingIcon, 
  Repaired as RepairedIcon, 
  Maintaining as MaintainingIcon, 
  Maintained as MaintainedIcon, 
  Servicing, 
  Serviced, 
  Updating as Updating2Icon, 
  Updated as Updated3Icon, 
  Upgrading as UpgradingIcon, 
  Upgraded as Upgraded2Icon, 
  Improving as ImprovingIcon, 
  Improved as Improved2Icon, 
  Enhancing as EnhancingIcon
} from "lucide-react"
import { cn } from "@/lib/utils"

interface UserProfile {
  id: string
  name: string
  email: string
  phone?: string
  avatar?: string
  company?: string
  role: string
  bio?: string
  location?: string
  timezone: string
  language: string
  currency: string
  dateFormat: string
  timeFormat: '12h' | '24h'
  theme: 'light' | 'dark' | 'system'
  notifications: {
    email: boolean
    push: boolean
    sms: boolean
    desktop: boolean
    marketing: boolean
    updates: boolean
    security: boolean
  }
  privacy: {
    profileVisibility: 'public' | 'private' | 'contacts'
    showEmail: boolean
    showPhone: boolean
    showLocation: boolean
    allowMessages: boolean
    allowCalls: boolean
  }
  security: {
    twoFactorEnabled: boolean
    loginAlerts: boolean
    sessionTimeout: number
    passwordLastChanged: Date
  }
  preferences: {
    autoSave: boolean
    defaultView: 'grid' | 'list' | 'cards'
    itemsPerPage: number
    showTutorials: boolean
    compactMode: boolean
    animations: boolean
    sounds: boolean
  }
}

interface SettingsPanelProps {
  user: UserProfile
  onUpdateProfile: (updates: Partial<UserProfile>) => void
  onChangePassword: (currentPassword: string, newPassword: string) => Promise<void>
  onExportData: () => void
  onDeleteAccount: () => void
  onSignOut: () => void
}

export function SettingsPanel({
  user,
  onUpdateProfile,
  onChangePassword,
  onExportData,
  onDeleteAccount,
  onSignOut
}: SettingsPanelProps) {
  const [activeTab, setActiveTab] = useState('profile')
  const [isEditing, setIsEditing] = useState(false)
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [formData, setFormData] = useState(user)
  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: ''
  })
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const handleSaveProfile = async () => {
    setIsSaving(true)
    try {
      await onUpdateProfile(formData)
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to save profile:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleChangePassword = async () => {
    if (passwordData.new !== passwordData.confirm) {
      alert('New passwords do not match')
      return
    }

    try {
      await onChangePassword(passwordData.current, passwordData.new)
      setShowPasswordDialog(false)
      setPasswordData({ current: '', new: '', confirm: '' })
      alert('Password changed successfully')
    } catch (error) {
      console.error('Failed to change password:', error)
      alert('Failed to change password')
    }
  }

  const handleNotificationChange = (key: keyof UserProfile['notifications'], value: boolean) => {
    const updatedNotifications = { ...formData.notifications, [key]: value }
    setFormData({ ...formData, notifications: updatedNotifications })
    onUpdateProfile({ notifications: updatedNotifications })
  }

  const handlePrivacyChange = (key: keyof UserProfile['privacy'], value: any) => {
    const updatedPrivacy = { ...formData.privacy, [key]: value }
    setFormData({ ...formData, privacy: updatedPrivacy })
    onUpdateProfile({ privacy: updatedPrivacy })
  }

  const handleSecurityChange = (key: keyof UserProfile['security'], value: any) => {
    const updatedSecurity = { ...formData.security, [key]: value }
    setFormData({ ...formData, security: updatedSecurity })
    onUpdateProfile({ security: updatedSecurity })
  }

  const handlePreferenceChange = (key: keyof UserProfile['preferences'], value: any) => {
    const updatedPreferences = { ...formData.preferences, [key]: value }
    setFormData({ ...formData, preferences: updatedPreferences })
    onUpdateProfile({ preferences: updatedPreferences })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your account settings and preferences</p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={onExportData}>
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          <Button variant="outline" onClick={onSignOut}>
            Sign Out
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile Information
                </CardTitle>
                <Button
                  variant={isEditing ? "default" : "outline"}
                  onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : isEditing ? (
                    <Save className="h-4 w-4 mr-2" />
                  ) : (
                    <Edit className="h-4 w-4 mr-2" />
                  )}
                  {isSaving ? 'Saving...' : isEditing ? 'Save' : 'Edit'}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
                    {formData.avatar ? (
                      <img src={formData.avatar} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <User className="h-8 w-8 text-muted-foreground" />
                    )}
                  </div>
                  {isEditing && (
                    <Button size="sm" className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full p-0">
                      <Camera className="h-3 w-3" />
                    </Button>
                  )}
                </div>
                
                <div className="flex-1">
                  <h3 className="font-medium">{formData.name}</h3>
                  <p className="text-sm text-muted-foreground">{formData.email}</p>
                  <Badge variant="outline" className="mt-1">{formData.role}</Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
                
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
                
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
                
                <div>
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    value={formData.company || ''}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
                
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location || ''}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
                
                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select
                    value={formData.timezone}
                    onValueChange={(value) => setFormData({ ...formData, timezone: value })}
                    disabled={!isEditing}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="America/New_York">Eastern Time</SelectItem>
                      <SelectItem value="America/Chicago">Central Time</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                      <SelectItem value="Europe/London">London</SelectItem>
                      <SelectItem value="Europe/Paris">Paris</SelectItem>
                      <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={formData.bio || ''}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  disabled={!isEditing}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                  </div>
                  <Switch
                    checked={formData.security.twoFactorEnabled}
                    onCheckedChange={(checked) => handleSecurityChange('twoFactorEnabled', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Login Alerts</Label>
                    <p className="text-sm text-muted-foreground">Get notified when someone logs into your account</p>
                  </div>
                  <Switch
                    checked={formData.security.loginAlerts}
                    onCheckedChange={(checked) => handleSecurityChange('loginAlerts', checked)}
                  />
                </div>
              </div>
              
              <div>
                <Label className="text-base">Session Timeout</Label>
                <p className="text-sm text-muted-foreground mb-3">Automatically log out after inactivity</p>
                <Select
                  value={formData.security.sessionTimeout.toString()}
                  onValueChange={(value) => handleSecurityChange('sessionTimeout', parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="240">4 hours</SelectItem>
                    <SelectItem value="480">8 hours</SelectItem>
                    <SelectItem value="0">Never</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <Label className="text-base">Password</Label>
                    <p className="text-sm text-muted-foreground">
                      Last changed: {formData.security.passwordLastChanged.toLocaleDateString()}
                    </p>
                  </div>
                  <Button onClick={() => setShowPasswordDialog(true)}>
                    Change Password
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Application Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-base">Language</Label>
                  <p className="text-sm text-muted-foreground mb-3">Choose your preferred language</p>
                  <Select
                    value={formData.language}
                    onValueChange={(value) => setFormData({ ...formData, language: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="de">Deutsch</SelectItem>
                      <SelectItem value="it">Italiano</SelectItem>
                      <SelectItem value="pt">Português</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label className="text-base">Currency</Label>
                  <p className="text-sm text-muted-foreground mb-3">Default currency for pricing</p>
                  <Select
                    value={formData.currency}
                    onValueChange={(value) => setFormData({ ...formData, currency: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                      <SelectItem value="CAD">CAD (C$)</SelectItem>
                      <SelectItem value="AUD">AUD (A$)</SelectItem>
                      <SelectItem value="JPY">JPY (¥)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label className="text-base">Date Format</Label>
                  <p className="text-sm text-muted-foreground mb-3">How dates are displayed</p>
                  <Select
                    value={formData.dateFormat}
                    onValueChange={(value) => setFormData({ ...formData, dateFormat: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                      <SelectItem value="DD MMM YYYY">DD MMM YYYY</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label className="text-base">Time Format</Label>
                  <p className="text-sm text-muted-foreground mb-3">12-hour or 24-hour format</p>
                  <Select
                    value={formData.timeFormat}
                    onValueChange={(value) => setFormData({ ...formData, timeFormat: value as '12h' | '24h' })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="12h">12-hour (AM/PM)</SelectItem>
                      <SelectItem value="24h">24-hour</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label className="text-base">Theme</Label>
                  <p className="text-sm text-muted-foreground mb-3">Choose your preferred theme</p>
                  <Select
                    value={formData.theme}
                    onValueChange={(value) => setFormData({ ...formData, theme: value as 'light' | 'dark' | 'system' })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label className="text-base">Default View</Label>
                  <p className="text-sm text-muted-foreground mb-3">Default layout for property listings</p>
                  <Select
                    value={formData.preferences.defaultView}
                    onValueChange={(value) => handlePreferenceChange('defaultView', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="grid">Grid</SelectItem>
                      <SelectItem value="list">List</SelectItem>
                      <SelectItem value="cards">Cards</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h4 className="font-medium mb-4">Interface Preferences</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">Auto Save</Label>
                      <p className="text-sm text-muted-foreground">Automatically save changes</p>
                    </div>
                    <Switch
                      checked={formData.preferences.autoSave}
                      onCheckedChange={(checked) => handlePreferenceChange('autoSave', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">Show Tutorials</Label>
                      <p className="text-sm text-muted-foreground">Display helpful tutorials and tips</p>
                    </div>
                    <Switch
                      checked={formData.preferences.showTutorials}
                      onCheckedChange={(checked) => handlePreferenceChange('showTutorials', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">Compact Mode</Label>
                      <p className="text-sm text-muted-foreground">Use a more compact interface</p>
                    </div>
                    <Switch
                      checked={formData.preferences.compactMode}
                      onCheckedChange={(checked) => handlePreferenceChange('compactMode', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">Animations</Label>
                      <p className="text-sm text-muted-foreground">Enable interface animations</p>
                    </div>
                    <Switch
                      checked={formData.preferences.animations}
                      onCheckedChange={(checked) => handlePreferenceChange('animations', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">Sound Effects</Label>
                      <p className="text-sm text-muted-foreground">Play sound effects for actions</p>
                    </div>
                    <Switch
                      checked={formData.preferences.sounds}
                      onCheckedChange={(checked) => handlePreferenceChange('sounds', checked)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="account" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserX className="h-5 w-5" />
                Account Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-yellow-800">Data Export</h4>
                      <p className="text-sm text-yellow-700 mt-1">
                        Download a copy of all your data including properties, leads, and analytics.
                      </p>
                      <Button variant="outline" className="mt-3" onClick={onExportData}>
                        <Download className="h-4 w-4 mr-2" />
                        Export My Data
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-red-800">Delete Account</h4>
                      <p className="text-sm text-red-700 mt-1">
                        Permanently delete your account and all associated data. This action cannot be undone.
                      </p>
                      <Button 
                        variant="destructive" 
                        className="mt-3"
                        onClick={() => setShowDeleteDialog(true)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Account
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Password Change Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Enter your current password and choose a new one.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="current-password">Current Password</Label>
              <div className="relative">
                <Input
                  id="current-password"
                  type={showCurrentPassword ? "text" : "password"}
                  value={passwordData.current}
                  onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            
            <div>
              <Label htmlFor="new-password">New Password</Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showNewPassword ? "text" : "password"}
                  value={passwordData.new}
                  onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            
            <div>
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={passwordData.confirm}
                  onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPasswordDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleChangePassword}>
              Change Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Account Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Account</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete your account? This action cannot be undone and will permanently remove all your data.
            </DialogDescription>
          </DialogHeader>
          
          <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
            <div className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-medium">This will permanently delete:</span>
            </div>
            <ul className="mt-2 text-sm text-red-700 space-y-1">
              <li>• All your properties and listings</li>
              <li>• Lead and contact information</li>
              <li>• Analytics and performance data</li>
              <li>• Social media content and campaigns</li>
              <li>• Account settings and preferences</li>
            </ul>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={onDeleteAccount}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                  </div>
                  <Switch
                    checked={formData.notifications.email}
                    onCheckedChange={(checked) => handleNotificationChange('email', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive push notifications in browser</p>
                  </div>
                  <Switch
                    checked={formData.notifications.push}
                    onCheckedChange={(checked) => handleNotificationChange('push', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">SMS Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive notifications via SMS</p>
                  </div>
                  <Switch
                    checked={formData.notifications.sms}
                    onCheckedChange={(checked) => handleNotificationChange('sms', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Desktop Notifications</Label>
                    <p className="text-sm text-muted-foreground">Show desktop notifications</p>
                  </div>
                  <Switch
                    checked={formData.notifications.desktop}
                    onCheckedChange={(checked) => handleNotificationChange('desktop', checked)}
                  />
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h4 className="font-medium mb-4">Notification Types</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">Marketing</Label>
                      <p className="text-sm text-muted-foreground">Product updates and marketing content</p>
                    </div>
                    <Switch
                      checked={formData.notifications.marketing}
                      onCheckedChange={(checked) => handleNotificationChange('marketing', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">Updates</Label>
                      <p className="text-sm text-muted-foreground">System updates and new features</p>
                    </div>
                    <Switch
                      checked={formData.notifications.updates}
                      onCheckedChange={(checked) => handleNotificationChange('updates', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">Security</Label>
                      <p className="text-sm text-muted-foreground">Security alerts and login notifications</p>
                    </div>
                    <Switch
                      checked={formData.notifications.security}
                      onCheckedChange={(checked) => handleNotificationChange('security', checked)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Privacy Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-base">Profile Visibility</Label>
                <p className="text-sm text-muted-foreground mb-3">Control who can see your profile</p>
                <Select
                  value={formData.privacy.profileVisibility}
                  onValueChange={(value) => handlePrivacyChange('profileVisibility', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="contacts">Contacts Only</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Show Email</Label>
                    <p className="text-sm text-muted-foreground">Display email address on profile</p>
                  </div>
                  <Switch
                    checked={formData.privacy.showEmail}
                    onCheckedChange={(checked) => handlePrivacyChange('showEmail', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Show Phone</Label>
                    <p className="text-sm text-muted-foreground">Display phone number on profile</p>
                  </div>
                  <Switch
                    checked={formData.privacy.showPhone}
                    onCheckedChange={(checked) => handlePrivacyChange('showPhone', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Show Location</Label>
                    <p className="text-sm text-muted-foreground">Display location on profile</p>
                  </div>
                  <Switch
                    checked={formData.privacy.showLocation}
                    onCheckedChange={(checked) => handlePrivacyChange('showLocation', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Allow Messages</Label>
                    <p className="text-sm text-muted-foreground">Allow others to send you messages</p>
                  </div>
                  <Switch
                    checked={formData.privacy.allowMessages}
                    onCheckedChange={(checked) => handlePrivacyChange('allowMessages', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Allow Calls</Label>
                    <p className="text-sm text-muted-foreground">Allow others to call you</p>
                  </div>
                  <Switch
                    checked={formData.privacy.allowCalls}
                    onCheckedChange={(checked) => handlePrivacyChange('allowCalls', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>