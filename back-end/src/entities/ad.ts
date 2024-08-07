import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ILike,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { ObjectType, Field, ID, Float } from "type-graphql";

import Category from "./category";
import Tag from "./tag";
import { CreateOrUpdateAd } from "./ad.args";
import User from "./user";
import { getCache } from "../cache";

type AdArgs = CreateOrUpdateAd & {
  owner: User;
};

@Entity()
@ObjectType()
class Ad extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  @Field(() => ID)
  id!: string;

  @Column()
  @Field()
  title!: string;

  @Column({ default: "" })
  @Field()
  description!: string;

  @ManyToOne(() => User, (user) => user.ads, { eager: true })
  @Field(() => User)
  owner!: User;

  @Column()
  @Field(() => Float)
  price!: number;

  @Column({ type: "int" })
  weightGrams!: number;

  @Column({ default: "" })
  @Field()
  picture!: string;

  @Column({ default: "" })
  @Field()
  location!: string;

  @CreateDateColumn()
  @Field()
  createdAt!: Date;

  @ManyToOne(() => Category, (category) => category.ads, { eager: true })
  @Field(() => Category)
  category!: Category;

  @JoinTable({ name: "TagsForAds" })
  @ManyToMany(() => Tag, (tag) => tag.ads, { eager: true })
  @Field(() => [Tag])
  tags!: Tag[];

  constructor(ad?: AdArgs) {
    super();

    if (ad) {
      this.title = ad.title;
      this.owner = ad.owner;
      this.description = ad.description;
      this.price = ad.price;
      this.weightGrams = ad.weightGrams;
      this.picture = ad.picture;
      this.location = ad.location;
    }
  }

  static async saveNewAd(adData: AdArgs): Promise<Ad> {
    const newAd = new Ad(adData);

    const category = await Category.getCategoryById(adData.categoryId);
    newAd.category = category;

    // Promise.all will call each function in array passed as argument and resolve when all are resolved
    newAd.tags = await Promise.all(adData.tagIds.map(Tag.getTagById));

    const savedAd = await newAd.save();
    return savedAd;
  }

  static async getAds(categoryId?: number): Promise<Ad[]> {
    const ads = await Ad.find({
      where: { category: { id: categoryId } },
      order: { createdAt: "DESC" },
      take: 20,
    });
    return ads;
  }

  static async getAdById(id: string): Promise<Ad> {
    const ad = await Ad.findOne({
      where: { id },
    });
    if (!ad) {
      throw new Error(`Ad with ID ${id} does not exist.`);
    }
    return ad;
  }

  static async deleteAd(id: string): Promise<Ad> {
    const ad = await Ad.getAdById(id);
    await Ad.delete(id);
    return ad;
  }

  static async updateAd(id: string, partialAd: CreateOrUpdateAd): Promise<Ad> {
    const ad = await Ad.getAdById(id);
    Object.assign(ad, partialAd);

    if (partialAd.categoryId) {
      ad.category = await Category.getCategoryById(partialAd.categoryId);
    }
    if (partialAd.tagIds) {
      ad.tags = await Promise.all(partialAd.tagIds.map(Tag.getTagById));
    }

    await ad.save();
    ad.reload();
    return ad;
  }

  static async searchAds(query: string): Promise<Ad[]> {
    const cache = await getCache();

    const cachedResult = await cache.get(query);
    if (cachedResult) {
      return JSON.parse(cachedResult);
    }

    const databaseResult = await Ad.find({
      where: [
        { title: ILike(`%${query}%`) },
        { description: ILike(`%${query}%`) },
      ],
    });

    cache.set(query, JSON.stringify(databaseResult), { EX: 600 });

    return databaseResult;
  }

  getStringRepresentation(): string {
    return `${this.id} | ${this.title} | ${this.owner} | ${this.price} €`;
  }
}

export default Ad;
