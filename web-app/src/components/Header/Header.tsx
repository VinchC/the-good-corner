import { Fragment } from "react";
import { CATEGORIES } from "../Layout/Layout";
import SearchIcon from "../Icons/SearchIcon";
import { PrimaryButton } from "../Button/PrimaryButton";

import * as styled from "./Header.styled";
import { ButtonLikeLink, Logo } from "../Link/ButtonLikeLink";
import { MainSearchField } from "../FormElements/Input/Input";
import { BaseLink } from "../Link/BaseLink";
import ResponsiveLabel from "../ResponsiveLabel/ResponsiveLabel";
import { gql, useQuery } from "@apollo/client";
import { GetMyProfileQuery } from "@/gql/graphql";

const GET_MY_PROFILE = gql`
  query GetMyProfile {
    myProfile {
      email
      id
      firstName
      lastName
    }
  }
`;

export default function Header() {
  const { data, loading } = useQuery<GetMyProfileQuery>(GET_MY_PROFILE);

  return (
    <styled.Header>
      <styled.MainMenu>
        <styled.MainTitle>
          <Logo href="/">
            <ResponsiveLabel mobileLabel="TGC" desktopLabel="THE GOOD CORNER" />
          </Logo>
        </styled.MainTitle>
        <styled.TextFieldWithButton>
          <MainSearchField type="search" />
          <PrimaryButton>
            <SearchIcon />
          </PrimaryButton>
        </styled.TextFieldWithButton>
        {!loading && (
          <ButtonLikeLink href="/my-profile">
            {data?.myProfile
              ? `${data.myProfile.firstName[0]}${data.myProfile.lastName[0]}`
              : "Me connecter"}
          </ButtonLikeLink>
        )}
        <ButtonLikeLink href="/publish-article">
          <ResponsiveLabel
            mobileLabel="Publier"
            desktopLabel="Publier une annonce"
          />
        </ButtonLikeLink>
      </styled.MainMenu>
      <styled.CategoriesNavigation>
        {CATEGORIES.map((category, index) => (
          <Fragment key={category.id}>
            <BaseLink href={`/categories/${category.id}`}>
              {category.name}
            </BaseLink>
            {index < CATEGORIES.length - 1 ? " • " : ""}
          </Fragment>
        ))}
      </styled.CategoriesNavigation>
    </styled.Header>
  );
}
